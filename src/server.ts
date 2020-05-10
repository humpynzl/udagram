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

  
  //Get /filteredimage end point
  // takes am image url and returns a filter version query
  app.get("/filteredimage/", async (req: Request, res: Response) => {
    let { image_url } = req.query;

    if (!image_url) {
      return res.status(400).send(`an image url must be given`);
    }

    //sanity check for well formed url
    if(!isValidURL(image_url)){
      return res.status(400).send(`malformed url was given`);
    }

    try {
      const filteredImagePath = await filterImageFromURL(image_url)

      //something went belly up
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