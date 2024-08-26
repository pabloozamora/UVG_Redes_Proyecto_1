# Proyecto 1: Uso de un Protocolo Existente (XMPP)

Universidad del Valle de Guatemala<br>
Redes - Sección 10<br>
Pablo Andrés Zamora Vásquez<br>
Carné 21780<br>

## Description
The objective of this project is to implement an instant messaging client using the XMPP protocol. Users can connect to an Openfire server to send and receive messages in real-time.

## Technologies Used
- npm: Package manager used to install dependencies.
- Vite: Development tool for building fast web applications.
- React: JavaScript library for building user interfaces.
- Strophe.js and xmpp.js: XMPP libraries for connecting and communicating with XMPP servers.

## Installation

1. Clone the repository with:
```
git clone https://github.com/pabloozamora/UVG_Redes_Proyecto_1.git
```

2. Navigate to the project directory:
```
cd <NOMBRE_DEL_DIRECTORIO>
```

3. Install the dependencies:
```
npm install
```

4. Make sure your vite.config.js file looks like this:

```
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'strophe.js': path.resolve(__dirname, 'node_modules/strophe.js'),
    },
    mainFields: ['main', 'browser'],
  },
  define: {
    'process.env': {},
    global: {},
    "global.WebSocket": "window.WebSocket",
    "global.btoa": "window.btoa.bind(window)",
  },
})
```

5. In the "package.json" file of "strophe.js" in the "node_modules" folder change the exports from "node" to "."

6. Start the development server:
```
npm run dev
```

## Features
- User management: Sign up, log in, log out and delete accounts.
- Contacts: Subscribe to others' presence and accept requests from others to suscribe to yours. Once you're suscribed to someone's presence, you can see their status and status message.
- One to one chats: Chat privately with any other account.
- Chat rooms: Create and join chatrooms using a nickname. If you create a chatroom, you can set a name and a password for it.
- Notifications: When you receive a new message from someone, their chat will be hightlighted on the "Chats" tab.
- File upload: You can send someone a file by uploading it to the server and they'll receive a url to access it.

## Screenshots
![image](https://github.com/user-attachments/assets/abeca790-22e1-431a-828c-db0154182f74)
![image](https://github.com/user-attachments/assets/e640e272-c408-4cf3-9ec9-fd71a03347d2)
![image](https://github.com/user-attachments/assets/d4600952-5916-4273-91b7-e7e63e5baff3)
![image](https://github.com/user-attachments/assets/cdeaae7e-49b2-4778-be28-b93ee85c507f)
![image](https://github.com/user-attachments/assets/b35e300f-73d1-4f4b-a89a-705c69bd4b58)
![image](https://github.com/user-attachments/assets/3e9842ef-e29d-4fea-be8a-fd209d78db82)






