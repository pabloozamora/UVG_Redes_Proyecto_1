// useXmppClient.js
import { client, xml } from '@xmpp/client/browser';
import { WEBSOCKET_SERVICE, XMPP_DOMAIN } from './xmppConfig';

/**
 *  Hook para manejar el cliente XMPP
 * @returns {Object} - Funciones para manejar el cliente XMPP
 */
const useXmppClient = () => {

  const handleSignUp = (user, password) => {
    try {
      const xmppClient = client({
        service: WEBSOCKET_SERVICE,
        resource: '',
      });

      return new Promise((resolve, reject) => {
        xmppClient.on('error', (err) => {
          if (err.code === 'ECONERROR') {
            console.error('Error de conexión', err);
            xmppClient.stop();
            xmppClient.removeAllListeners();
            reject({ status: false, message: 'Error en el cliente XMPP' });
          }
        });

        xmppClient.on('open', () => {
          console.log('Connection established');
          const iq = xml(
            'iq',
            { type: 'set', to: XMPP_DOMAIN, id: 'register' },
            xml(
              'query',
              { xmlns: 'jabber:iq:register' },
              xml('username', {}, user),
              xml('password', {}, password)
            )
          );
          xmppClient.send(iq);
        });
  
        xmppClient.on('stanza', async (stanza) => {
          if (stanza.is('iq') && stanza.getAttr("id") === "register") {
            console.log('Registro exitoso');
            await xmppClient.stop();
            xmppClient.removeAllListeners();
            if (stanza.getAttr("type") === "result") {
              resolve({ status: true, message: 'Registro exitoso. Ahora puedes hacer login.' });
            } else if (stanza.getAttr("type") === "error") {
              console.log('Error en registro', stanza);
              const error = stanza.getChild("error");
              if (error?.getChild("conflict")) {
                reject({ status: false, message: 'El usuario ya está en uso.' });
              }
              reject({ status: false, message: 'Ocurrió un error en tu registro. Intenta nuevamente' });
            }
          }
        });

        xmppClient.start().catch((err) => { reject({ status: 'failed', message: `Error de cliente: ${err}` }); });
      });
    } catch (error) {
      console.error('❌ Error en el registro', error);
      throw error;
    }
  }

  return {
    handleSignUp,
  };
};

export default useXmppClient;
