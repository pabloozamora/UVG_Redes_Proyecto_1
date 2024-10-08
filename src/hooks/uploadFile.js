/**
 * Helper para subir un archivo a un servidor
 * @param {*} file: Archivo a subir
 * @param {string} putUrl: URL de subida
 */
const uploadFile = async (file, putUrl) => {
    try {
      const response = await fetch(putUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
  
      if (response.ok) {
        console.log('File uploaded successfully');
      } else {
        console.error('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  export default uploadFile;
  