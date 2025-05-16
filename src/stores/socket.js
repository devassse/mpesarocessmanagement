import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import {ws_ip} from 'src/boot/ips';

export const useSocketStore = defineStore('socket', {
  state: () => ({
    socket: null,
    isConnected: false,
  }),

  actions: {
    async initSocket() {
      const authToken = this.getAuthToken();

      if (!authToken || this.socket?.connected) return;

      this.socket = io(`${ws_ip}` || 'http://localhost:3000', {
        auth: { token: authToken }
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.isConnected = true;
      });
    },

    getAuthToken() {
      if (window.electronAPI) {
        return window.electronAPI.getCookie('authToken');
      }
      return Cookies.get('authToken');
    },

    disconnect() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.isConnected = false;
      }
    }
  }
});
