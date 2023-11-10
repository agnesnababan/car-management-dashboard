const Router = require('express').Router;
const db = require('../../../config/database');
const upload = require('../../../config/upload'); // multer
const storage = require('../../../config/storages'); // cloudinary

// /api/cars
function ApiRouterCars() {
  const router = Router(); // instance dari function Router

  // List -> Membaca isi data mobil pada database (Read)
  router.get('/', async (req, res) => {
    try {
      const data = await db.select('*').from('car_product');
      res.status(200).json({
        data,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({
        message: 'Internal Server Error',
      });
    }
  });

  // Single -> Membaca 1 isi mobil berdasarkan id (Read)
  router.get('/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const data = await db.select('*').from('car_product').where('car_id', '=', id);
      res.status(200).json({
        data: data[0],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({
        message: 'Internal Server Error',
      });
    }
  });

  // Menambahkan mobil ke dalam database (Create)
  router.post('/', upload.single('image'), async (req, res) => {
    try {
      const pictureBase64 = req.file.buffer.toString('base64');
      const pictureDataUrl = `data:${req.file.mimetype};base64,${pictureBase64}`;

      const pictureUploadResult = await new Promise((resolve, reject) => {
        storage.uploader.upload(pictureDataUrl, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      const carsUpload = {
        car_name: req.body.car_name,
        price: req.body.price,
        update_time: req.body.update_time,
        image: pictureUploadResult.url,
      };

      const data = await db('car_product').insert(carsUpload).returning('*');

      return res.status(200).json({
        message: 'Upload Berhasil',
        data,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({
        message: 'Internal Server Error',
      });
    }
  });

  // Mengupdate data mobil terbaru
  router.put('/:id', upload.single('image'), async (req, res) => {
    try {
      const id = req.params.id;

      // Ambil data yang akan diupdate
      const existingCar = await db.select('*').from('car_product').where('car_id', '=', id).first();

      if (!existingCar) {
        return res.status(404).json({
          message: 'Data not found.',
          success: false,
        });
      }

      const updateData = {
        car_name: req.body.car_name || existingCar.car_name,
        price: req.body.price || existingCar.price,
        update_time: req.body.update_time || existingCar.update_time,
        image: existingCar.image, // Default picture from existing car data
      };

      // Jika ada gambar baru diunggah, tambahkan URL gambar baru
      if(req.file) {
        const pictureBase64 = req.file.buffer.toString('base64');
        const pictureDataUrl = `data:${req.file.mimetype};base64,${pictureBase64}`;

        const pictureUploadResult = await new Promise((resolve, reject) => {
          storage.uploader.upload(pictureDataUrl, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });

        updateData.image = pictureUploadResult.url;
      }

      // Lakukan update ke database
      const updatedData = await db('car_product').where('car_id', '=', id).update(updateData).returning('*');

      return res.status(200).json({
        message: 'Update success!',
        data: updatedData,
      });
    } catch (error) {
      console.error('Error updating data:', error);
      res.status(500).json({
        message: 'Internal Server Error',
        success: false,
      });
    }
  });

  // Menghapus data mobil berdasarkan id pada database (Delete)
  router.delete('/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const deleteResult = await db('car_product').del().where('car_id', '=', id);

      if (deleteResult === 1) {
        res.status(200).json({
          message: 'Delete success!',
          success: true,
        });
      } else {
        res.status(404).json({
          message: 'Data not found or failed to delete.',
          success: false,
        });
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      res.status(500).json({
        message: 'Internal Server Error',
        success: false,
      });
    }
  });

  return router;
}

module.exports = ApiRouterCars;
