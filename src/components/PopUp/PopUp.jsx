import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import fadeOut from '../../helpers/animations/fadeOut';
import styles from './PopUp.module.css';

/**
 * Función que renderiza un componente PopUp
 * @param {close} close - Función para cerrar el PopUp
 * @param {maxWidth} maxWidth - Ancho máximo del PopUp
 * @param {closeWithBackground} closeWithBackground - Indica si se cierra al hacer click en el fondo
 * @param {closeButton} closeButton - Indica si se muestra el botón de cerrar
 * @param {children} children - Elementos hijos
 * @param {callback} callback - Función de callback al cerrar el PopUp
 * @returns {JSX.Element} - Componente PopUp
 */
function PopUp({
  close, maxWidth, closeWithBackground, closeButton, children, callback,
}) {
  const refPopUp = useRef();

  const closeAnimation = () => {
    fadeOut(refPopUp.current, 300, () => {
      close();
      if (callback) callback();
    });
  };

  const handleCloseWithBackground = (e) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();

      if (closeWithBackground) {
        closeAnimation();
      }
    }
  };

  const handleCloseWithButton = (e) => {
    e.stopPropagation();
    if (closeButton) {
      closeAnimation();
    }
  };

  return (
    <div
      className={styles.popUp}
      ref={refPopUp}
      onClick={handleCloseWithBackground}
      onKeyUp={handleCloseWithBackground}
      role="button"
      tabIndex="0"
    >
      <div className={`${styles.popUpBody} ${styles.scrollbarGray}`} style={{ maxWidth: `${maxWidth}px` }}>
        <div className={styles.popUpHeader}>
          {closeButton ? (
            // eslint-disable-next-line jsx-a11y/control-has-associated-label
            <div
              className={styles.xIcon}
              onClick={handleCloseWithButton}
              onKeyUp={handleCloseWithButton}
              role="button"
              tabIndex="0"
            />
          ) : null}
        </div>
        <div className={styles.popUpBodyContainer}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default PopUp;

PopUp.propTypes = {
  maxWidth: PropTypes.number,
  close: PropTypes.func.isRequired,
  callback: PropTypes.func,
  closeWithBackground: PropTypes.bool,
  closeButton: PropTypes.bool,
  children: PropTypes.node,
};

PopUp.defaultProps = {
  maxWidth: 700,
  closeWithBackground: true,
  closeButton: true,
  callback: null,
  children: null,
};
