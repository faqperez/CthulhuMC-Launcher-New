/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';

import { database, changePanel, addAccount, accountSelect } from '../utils.js';
const { AZauth } = require('minecraft-java-core');
const { ipcRenderer } = require('electron');
const pkg = require('../package.json');


class Login {
    
    static id = "login";
    async init(config) {
        this.config = config
        this.database = await new database().init();
        if (this.config.online) this.getOnline()
        else this.getOffline()
    }
    async refreshData() {

        document.querySelector('.player-role').innerHTML = '';
        document.querySelector('.player-monnaie').innerHTML = '';
        
        await this.initOthers();
        await this.initPreviewSkin();
    }
    async initPreviewSkin() {
        console.log('initPreviewSkin called');
        const websiteUrl = this.config.azauth;
        let uuid = (await this.database.get('1234', 'accounts-selected')).value;
        let account = (await this.database.get(uuid.selected, 'accounts')).value;
    
        let title = document.querySelector('.player-skin-title');
        title.innerHTML = `Skin de ${account.name}`;
    
        const skin = document.querySelector('.skin-renderer-settings');
        const cacheBuster = new Date().getTime();
        const url = `${websiteUrl}/skin3d/3d-api/skin-api/${account.name}?_=${cacheBuster}`;
        skin.src = url;
    }
    getOnline() {
        // console.log(`Initializing microsoft Panel...`)
        // console.log(`Initializing mojang Panel...`)
        console.log(`Inicializando el Panel Az...`)
        this.loginMicrosoft();
        this.loginMojang();
        document.querySelector('.cancel-login').addEventListener("click", () => {
            document.querySelector(".cancel-login").style.display = "none";
            changePanel("settings");
        })
    }

    getOffline() {
        console.log(`Inicializando el panel de Microsoft...`)
        console.log(`Inicializando el Panel mojang...`)
        console.log(`Inicializando el Panel fuera de línea...`)
        this.loginMicrosoft();
        this.loginOffline();
        document.querySelector('.cancel-login').addEventListener("click", () => {
            document.querySelector(".cancel-login").style.display = "none";
            changePanel("settings");
        })
    }

    loginMicrosoft() {
        let microsoftBtn = document.querySelector('.microsoft')
        let mojangBtn = document.querySelector('.mojang')
        let cancelBtn = document.querySelector('.cancel-login')
       
        microsoftBtn.addEventListener("click", () => {
            microsoftBtn.disabled = true;
            mojangBtn.disabled = true;
            cancelBtn.disabled = true;
            ipcRenderer.invoke('Microsoft-window', this.config.client_id).then(account_connect => {
                if (!account_connect) {
                    microsoftBtn.disabled = false;
                    mojangBtn.disabled = false;
                    cancelBtn.disabled = false;
                    return;
                }

                let account = {
                    access_token: account_connect.access_token,
                    client_token: account_connect.uuid,
                    uuid: account_connect.uuid,
                    name: account_connect.name,
                    refresh_token: account_connect.refresh_token,
                    user_properties: account_connect.user_properties,
                    meta: {
                        type: account_connect.meta.type,
                        demo: account_connect.meta.demo
                    },
                    user_info: {
                        role: account_connect.user_info.role,
                        monnaie: account_connect.user_info.money,
                    },
                }

                let profile = {
                    uuid: account_connect.uuid,
                    /*skins: account_connect.profile.skins || [],
                    capes: account_connect.profile.capes || []*/
                }

                this.database.add(account, 'accounts')
                this.database.add(profile, 'profile')
                this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');

                addAccount(account)
                accountSelect(account.uuid)
                changePanel("settings");

                microsoftBtn.disabled = false;
                mojangBtn.disabled = false;
                cancelBtn.disabled = false;
                cancelBtn.style.display = "none";
            }).catch(err => {
                console.log(err)
                microsoftBtn.disabled = false;
                mojangBtn.disabled = false;
                cancelBtn.disabled = false;

            });
        })
    }

    async loginMojang() {
        let mailInput = document.querySelector('.Mail')
        let passwordInput = document.querySelector('.Password')
        let cancelMojangBtn = document.querySelector('.cancel-mojang')
        let infoLogin = document.querySelector('.info-login')
        let infoConnect = document.querySelector('.info-connect')
        let loginBtn = document.querySelector(".login-btn")
        let mojangBtn = document.querySelector('.mojang')
        let loginBtn2f = document.querySelector('.login-btn-2f')
        let a2finput = document.querySelector('.a2f')
        let infoLogin2f = document.querySelector('.info-login-2f')
        let cancel2f = document.querySelector('.cancel-2f')
        
        let azauth = this.config.azauth
        let newuserurl = `${azauth}/user/register`
        this.newuser = document.querySelector(".new-user");
        this.newuser.innerHTML="¿Sin cuenta? Registrate..."
        this.newuser.setAttribute ("href", newuserurl)

        let passwordreseturl = `${azauth}/user/password/reset`
        this.passwordreset = document.querySelector(".password-reset");
        this.passwordreset.innerHTML="¿Olvidaste tu contraseña?"
        this.passwordreset.setAttribute ("href", passwordreseturl)

        mojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "none";
            document.querySelector(".login-card-mojang").style.display = "block";
            document.querySelector('.a2f-card').style.display = "none";
        })

        cancelMojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "block";
            document.querySelector(".login-card-mojang").style.display = "none";
            document.querySelector('.a2f-card').style.display = "none";
        })
        cancel2f.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "block";
            document.querySelector(".login-card-mojang").style.display = "none";
            document.querySelector('.a2f-card').style.display = "none";
            infoLogin.style.display = "none";
            cancelMojangBtn.disabled = false;
            mailInput.value = "";
            loginBtn.disabled = false;
            mailInput.disabled = false;
            passwordInput.disabled = false;
            passwordInput.value = "";
        })

        loginBtn2f.addEventListener("click", async() => {
         if (a2finput.value == "") {
                infoLogin2f.innerHTML = "Introduce tu código A2F"
                return
            }
            let azAuth = new AZauth(azauth);

            await azAuth.login(mailInput.value, passwordInput.value, a2finput.value).then(async account_connect => {
                console.log(account_connect);
                if (account_connect.error) {
                    infoLogin2f.innerHTML = 'Su código A2F no es válido'
                    return
                }
                let account = {
                    access_token: account_connect.access_token,
                    client_token: account_connect.uuid,
                    uuid: account_connect.uuid,
                    name: account_connect.name,
                    user_properties: account_connect.user_properties,
                    meta: {
                        type: account_connect.meta.type,
                        offline: true
                    },
                    user_info: {
                        role: account_connect.user_info.role,
                        monnaie: account_connect.user_info.money,
                    },
                    
                    
                }

                this.database.add(account, 'accounts')
                this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');

                addAccount(account)
                accountSelect(account.uuid)
                changePanel("settings");

                cancelMojangBtn.disabled = false;
                cancelMojangBtn.click();
                mailInput.value = "";
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                loginBtn.style.display = "block";
                infoLogin.innerHTML = "&nbsp;";
            })

            

        })



        loginBtn.addEventListener("click", async() => {
            cancelMojangBtn.disabled = true;
            loginBtn.disabled = true;
            mailInput.disabled = true;
            passwordInput.disabled = true;
            infoLogin.innerHTML = "Conexión en progreso...";


            if (mailInput.value == "") {
                console.log(mailInput.value);
                infoLogin.innerHTML = "Introduce tu usuario"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            if (passwordInput.value == "") {
                infoLogin.innerHTML = "Introduce tu contraseña"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }
            let azAuth = new AZauth(azauth);

            await azAuth.login(mailInput.value, passwordInput.value).then(async account_connect => {
                console.log(account_connect);

                if (account_connect.A2F === true) {
                    document.querySelector('.a2f-card').style.display = "block";
                    document.querySelector(".login-card-mojang").style.display = "none";
                    cancelMojangBtn.disabled = false;
                    return

                }
               
                if (account_connect.reason === 'user_banned') {
                    cancelMojangBtn.disabled = false;
                    loginBtn.disabled = false;
                    mailInput.disabled = false;
                    passwordInput.disabled = false;
                    infoLogin.innerHTML = 'Tu cuenta está prohibida. <br>Vaya a nuestro discord para cualquier disputa.'
                    return
                }
                
                cancelMojangBtn.addEventListener("click", () => {
                    document.querySelector(".login-card").style.display = "block";
                    document.querySelector(".login-card-mojang").style.display = "none";
                    document.querySelector('.a2f-card').style.display = "none";
                })

             

                let account = {
                    access_token: account_connect.access_token,
                    client_token: account_connect.uuid,
                    uuid: account_connect.uuid,
                    name: account_connect.name,
                    user_properties: account_connect.user_properties,
                    meta: {
                        type: account_connect.meta.type,
                        offline: true
                    },
                    user_info: {
                        role: account_connect.user_info.role,
                        monnaie: account_connect.user_info.money,
                    },
                    
                    
                }
                

                this.database.add(account, 'accounts')
                this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');


                addAccount(account)
                accountSelect(account.uuid)
                changePanel("settings");

                cancelMojangBtn.disabled = false;
                cancelMojangBtn.click();
                mailInput.value = "";
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                loginBtn.style.display = "block";
                infoLogin.innerHTML = "&nbsp;";
            }).catch(err => {
                console.log(err);
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                infoLogin.innerHTML = 'E-mail/usuario o contraseña no válidos'
            })
        })
    }

    loginOffline() {
        let mailInput = document.querySelector('.Mail')
        let passwordInput = document.querySelector('.Password')
        let cancelMojangBtn = document.querySelector('.cancel-mojang')
        let infoLogin = document.querySelector('.info-login')
        let loginBtn = document.querySelector(".login-btn")
        let mojangBtn = document.querySelector('.mojang')

        mojangBtn.innerHTML = "Offline"

        mojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "none";
            document.querySelector(".login-card-mojang").style.display = "block";
        })

        cancelMojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "block";
            document.querySelector(".login-card-mojang").style.display = "none";
        })

        loginBtn.addEventListener("click", () => {
            cancelMojangBtn.disabled = true;
            loginBtn.disabled = true;
            mailInput.disabled = true;
            passwordInput.disabled = true;
            infoLogin.innerHTML = "Conexión en progreso...";


            if (mailInput.value == "") {
                infoLogin.innerHTML = "Ingrese su correo electrónico / nombre de usuario"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            if (mailInput.value.length < 3) {
                infoLogin.innerHTML = "Su nombre de usuario debe tener al menos 3 caracteres"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            Mojang.getAuth(mailInput.value, passwordInput.value).then(async account_connect => {
                let account = {
                    access_token: account_connect.access_token,
                    client_token: account_connect.uuid,
                    uuid: account_connect.uuid,
                    name: account_connect.name,
                    user_properties: account_connect.user_properties,
                    meta: {
                        type: account_connect.meta.type,
                        offline: account_connect.meta.offline
                    },
                }

                this.database.add(account, 'accounts')
                this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');

                addAccount(account)
                accountSelect(account.uuid)
                changePanel("settings");

                cancelMojangBtn.disabled = false;
                cancelMojangBtn.click();
                mailInput.value = "";
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                loginBtn.style.display = "block";
                infoLogin.innerHTML = "&nbsp;";
            }).catch(err => {
                console.log(err)
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                infoLogin.innerHTML = 'Dirección de correo electrónico o contraseña no válida.'
            })
        })
    }
    
}

export default Login;
