// firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyB5WWU8JzA8mIrDKrhKy336jQ6mKOT7FUs",
  authDomain: "snake-ftw.firebaseapp.com",
  databaseURL: "https://snake-ftw-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "snake-ftw",
  storageBucket: "snake-ftw.firebasestorage.app",
  messagingSenderId: "786454070390",
  appId: "1:786454070390:web:97c2f2ab60922513b90b57"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

window.RoomManager = {
  generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let c = '';
    for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
    return c;
  },
  async createRoom(code) {
    await db.ref('rooms/' + code).set({
      state: 'lobby', host: '', createdAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async checkRoom(code) {
    const snap = await db.ref('rooms/' + code).once('value');
    return snap.exists();
  }
};

window.getRoomRef = (code) => db.ref('rooms/' + code);
window.getPlayersRef = (code) => db.ref('rooms/' + code + '/players');
