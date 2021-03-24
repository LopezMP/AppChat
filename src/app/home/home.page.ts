import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  message = '';
  messages = [];
  currentUser = '';

  constructor(private socket: Socket, private toastCtrl: ToastController) { }  

  ngOnInit() {
    this.socket.connect();

    let name = `user-${new Date().getTime()}`;    //random name basado en tiempo de entrada al chat
    this.currentUser = name;

    this.socket.emit('set-name', name);           //emitir al server (a todos los users) que has entrado

    this.socket.fromEvent('users-changed').subscribe(data => {  //server devuelve el evento a traves de user-changed 
      let user = data['user'];
      if (data['event'] === 'left') {
        this.showToast('User left: ' + user);
      } else {
        this.showToast('User joined: ' + user);
      }
    });

    this.socket.fromEvent('message').subscribe(message => {   //recibir mensajes
      this.messages.push(message);
    });
  }

  sendMessage() {
    this.socket.emit('send-message', { text: this.message });   //enviar mensaje al resto de users
    this.message = '';                                          //vaciar textbox despues de enviar el mensaje
  }

  ionViewWillLeave() {
    this.socket.disconnect();
  }

  async showToast(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }
}
