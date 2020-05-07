import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, isValidURL} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());



  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  


  
  //Get /filteredimage emd point
  // takes am image url and returns a filter version query
  app.get("/filteredimage/", async (req: Request, res: Response) => {
    let { imageurl } = req.query;

    if (!imageurl) {
      return res.status(400).send(`an image url must be given`);
    }

    //sanity check for well formed url
    if(!isValidURL(imageurl)){
      return res.status(400).send(`an image url must be given`);
    }

    try {
      const filteredImagePath = await filterImageFromURL(imageurl)

      //better safe than sorry
      if(!filteredImagePath){
        return res.status(422).send("An unkown error occurred processing the image");
      }

      await res.sendFile(filteredImagePath, {}, (err) => {

        //clean up locals files regardless if somethings gone wrong
        deleteLocalFiles([filteredImagePath])

        //somethings gone belly up.
        if (err) { 
          return res.status(422).send("An error occurred processing the image: " + err.message); 
        }
      })
    } catch (err) {
      //something went wrong down below
      res.status(422).send("An error occurred processing the image: " + err.message);
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();