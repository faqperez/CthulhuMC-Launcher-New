/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';

import { logger, database, changePanel} from '../utils.js';

const { Launch, Status } = require('minecraft-java-core');
const { ipcRenderer } = require('electron');
const launch = new Launch();
const pkg = require('../package.json');

const dataDirectory = process.env.APPDATA || (process.platform == 'darwin' ? `${process.env.HOME}/Library/Application Support` : process.env.HOME)

class Home {
    static id = "home";
    async init(config, news) {
        this.database = await new database().init();
        this.config = config
        this.news = await news
        this.initNews();
        this.initLaunch();
        this.initStatusServer();
        this.initBtn();
        this.bkgrole();
    }

    async initNews() {
        let news = document.querySelector('.news-list');
        if (this.news) {
            if (!this.news.length) {
                let blockNews = document.createElement('div');
                blockNews.classList.add('news-block', 'opacity-1');
                blockNews.innerHTML = `
                    <div class="news-header">
                        <div class="header-text">
                            <div class="title">Actualmente no hay noticias disponibles.</div>
                        </div>
                    </div>
                    <div class="news-content">
                        <div class="bbWrapper">
                            <p>Puedes seguir todas las novedades relativas al servidor aquí.</p>
                        </div>
                    </div>`
                news.appendChild(blockNews);
            } else {
                for (let News of this.news) {
                    let date = await this.getdate(News.publish_date)
                    let blockNews = document.createElement('div');
                    blockNews.classList.add('news-block');
                    blockNews.innerHTML = `
                        <div class="news-header">
                            <div class="header-text">
                                <div class="title">${News.title}</div>
                            </div>
                            <div class="date">
                                <div class="day">${date.day}</div>
                                <div class="month">${date.month}</div>
                            </div>
                        </div>
                        <div class="news-content">
                            <div class="bbWrapper">
                                <p>${News.content}</p>
                                <p class="news-author"><span> ${News.author}</span></p>
                            </div>
                        </div>`
                    news.appendChild(blockNews);
                }
            }
        } else {
            let blockNews = document.createElement('div');
            blockNews.classList.add('news-block', 'opacity-1');
            blockNews.innerHTML = `
                <div class="news-header">
                    <div class="header-text">
                        <div class="title">Error.</div>
                    </div>
                </div>
                <div class="news-content">
                    <div class="bbWrapper">
                        <p>No se puede contactar con el servidor de noticias.</br>Compruebe su configuración.</p>
                    </div>
                </div>`
            // news.appendChild(blockNews);
        }
        let serverimg = document.querySelector('.server-img')
        serverimg.setAttribute("src", `${this.config.server_img}`)
        if(!this.config.server_img) {
            serverimg.style.display = "none";
        }
    }
    
    async bkgrole () {
        let uuid = (await this.database.get('1234', 'accounts-selected')).value;
        let account = (await this.database.get(uuid.selected, 'accounts')).value;
        
        let blockRole = document.createElement("div");
        if (this.config.whitelist_activate === true) {
        if (!this.config.whitelist.includes(account.name)) {
            document.querySelector(".play-btn").style.backgroundColor = "#AB9E9E"; // Couleur de fond grise
            document.querySelector(".play-btn").style.pointerEvents = "none"; // Désactiver les événements de souris
            document.querySelector(".play-btn").style.boxShadow = "none";
            document.querySelector(".play-btn").textContent = "Non whitelist";   ;    
        }
    }
        
        if (account.user_info.role.name === this.config.role_data.role1.name) {
            document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${this.config.role_data.role1.background}) black no-repeat center center scroll`;
        }
        if (account.user_info.role.name === this.config.role_data.role2.name) {
            document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${this.config.role_data.role2.background}) black no-repeat center center scroll`;
        }
        if (account.user_info.role.name === this.config.role_data.role3.name) {
            document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${this.config.role_data.role3.background}) black no-repeat center center scroll`;
        }
        if (account.user_info.role.name === this.config.role_data.role4.name) {
            document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${this.config.role_data.role4.background}) black no-repeat center center scroll`;
        }
        if (account.user_info.role.name === this.config.role_data.role5.name) {
            document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${this.config.role_data.role5.background}) black no-repeat center center scroll`;
        }
        if (account.user_info.role.name === this.config.role_data.role6.name) {
            document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${this.config.role_data.role6.background}) black no-repeat center center scroll`;
        }
        if (account.user_info.role.name === this.config.role_data.role7.name) {
            document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${this.config.role_data.role7.background}) black no-repeat center center scroll`;
        }
        if (account.user_info.role.name === this.config.role_data.role8.name) {
            document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${this.config.role_data.role8.background}) black no-repeat center center scroll`;
        }
        
       
    }

    async initLaunch() {
        document.querySelector('.play-btn').addEventListener('click', async () => {
            let urlpkg = pkg.user ? `${pkg.url}/${pkg.user}` : pkg.url;
            let uuid = (await this.database.get('1234', 'accounts-selected')).value;
            let account = (await this.database.get(uuid.selected, 'accounts')).value;
            let ram = (await this.database.get('1234', 'ram')).value;
            let javaPath = (await this.database.get('1234', 'java-path')).value;
            let javaArgs = (await this.database.get('1234', 'java-args')).value;
            let Resolution = (await this.database.get('1234', 'screen')).value;
            let launcherSettings = (await this.database.get('1234', 'launcher')).value;
            let screen;

            let playBtn = document.querySelector('.play-btn');
            let info = document.querySelector(".text-download")
            let progressBar = document.querySelector(".progress-bar")
            let latenceBar = document.querySelector(".latence-bar")

            if (Resolution.screen.width == '<auto>') {
                screen = false
            } else {
                screen = {
                    width: Resolution.screen.width,
                    height: Resolution.screen.height
                }
            }
            
            let opts = {
                url: `${pkg.settings}/data`,
                authenticator: account,
                timeout: 15000,
                path: `${dataDirectory}/${process.platform == 'darwin' ? this.config.dataDirectory : `.${this.config.dataDirectory}`}`,
                version: this.config.game_version,
                detached: launcherSettings.launcher.close === 'close-all' ? false : true,
                downloadFileMultiple: 20,
                loader: {
                    type: this.config.loader.type,
                    build: this.config.loader.build,
                    enable: this.config.loader.enable,
                },
                verify: this.config.verify,
                ignored: this.config.ignored,

                java: this.config.java,
                memory: {
                    min: `${ram.ramMin * 1024}M`,
                    max: `${ram.ramMax * 1024}M`
                }
            }

            playBtn.style.display = "none"
            info.style.display = "block"
            launch.Launch(opts);

            launch.on('extract', extract => {
                console.log(extract);
            });

            launch.on('progress', (progress, size) => {
                progressBar.style.display = "block"
                document.querySelector(".text-download").innerHTML = `Descargar ${((progress / size) * 100).toFixed(0)}%`
                ipcRenderer.send('main-window-progress', { progress, size })
                progressBar.value = progress;
                progressBar.max = size;
            });

            launch.on('check', (progress, size) => {
                progressBar.style.display = "block"
                document.querySelector(".text-download").innerHTML = `Verificación ${((progress / size) * 100).toFixed(0)}%`
                progressBar.value = progress;
                progressBar.max = size;
            });

            launch.on('estimated', (time) => {
                let hours = Math.floor(time / 3600);
                let minutes = Math.floor((time - hours * 3600) / 60);
                let seconds = Math.floor(time - hours * 3600 - minutes * 60);
                console.log(`${hours}h ${minutes}m ${seconds}s`);
            })

            launch.on('speed', (speed) => {
                console.log(`${(speed / 1067008).toFixed(2)} Mb/s`);
            })

            launch.on('patch', patch => {
                console.log(patch);
                info.innerHTML = `Instalando parche...`
            });

            launch.on('data', (e) => {
                new logger('Minecraft', '#36b030');
                if (launcherSettings.launcher.close === 'close-launcher') ipcRenderer.send("main-window-hide");
                ipcRenderer.send('main-window-progress-reset')
                progressBar.style.display = "none"
                info.innerHTML = `Poniendo en marcha...`
                console.log(e);
            })

            launch.on('close', code => {
                if (launcherSettings.launcher.close === 'close-launcher') ipcRenderer.send("main-window-show");
                progressBar.style.display = "none"
                info.style.display = "none"
                playBtn.style.display = "block"
                info.innerHTML = `Verificación`
                new logger('Launcher', '#7289da');
                console.log('Close');
            });

            launch.on('error', err => {
                console.log(err);
            });
        })
    }

    async initStatusServer() {
        let nameServer = document.querySelector('.server-text .name');
        let serverMs = document.querySelector('.server-text .desc');
        let playersConnected = document.querySelector('.etat-text .text');
        let online = document.querySelector(".etat-text .online");
        let serverPing = await new Status(this.config.status.ip, this.config.status.port).getStatus();

        if (!serverPing.error) {
            nameServer.textContent = this.config.status.nameServer;
            serverMs.innerHTML = `<span class="green">En línea</span> - ${serverPing.ms}ms`;
            online.classList.toggle("off");
            playersConnected.textContent = serverPing.playersConnect;
        } else if (serverPing.error) {
            nameServer.textContent = 'Servidor no disponible';
            serverMs.innerHTML = `<span class="red">Desconectado</span>`;
        }
    }

    initBtn() {
        let settings_url = pkg.user ? `${pkg.settings}/${pkg.user}` : pkg.settings
        document.querySelector('.settings-btn').addEventListener('click', () => {
            changePanel("settings");
        });

        document.querySelector('.home-btn').addEventListener('click', () => {
            changePanel("home");
        });

        document.getElementById("discord").addEventListener("click", function() {
            window.open("https://discord.gg/HHrDNgsTN2", "_blank");
        });

        document.getElementById("boutique").addEventListener("click", function() {
            window.open("https://cthulhumc.com/shop", "_blank");
        });

        document.getElementById("vote").addEventListener("click", function() {
            window.open("https://cthulhumc.com/vote", "_blank");
        });
        
        
    }

    async getdate(e) {
        let date = new Date(e)
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        let allMonth = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        return { year: year, month: allMonth[month - 1], day: day }
    }
}

export default Home;