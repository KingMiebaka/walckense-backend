import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();


// ================================
// CORS
// ================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://walckenseengineering.com",
  "https://www.walckenseengineering.com"
];


app.use((req, res, next) => {

  const origin = req.headers.origin;


  if (allowedOrigins.includes(origin)) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      origin
    );
  }


  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );


  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );


  res.setHeader(
    "Access-Control-Max-Age",
    "86400"
  );


  if (req.method === "OPTIONS") {

    return res.status(200).end();

  }


  next();

});


app.use(express.json());





// ================================
// ROOT TEST
// ================================

app.get("/", (req,res)=>{

  res.json({
    message:"Walckense backend is running"
  });

});





// ================================
// HEALTH
// ================================

app.get("/health",(req,res)=>{

  res.json({
    ok:true,
    message:"Backend running"
  });

});





// ================================
// READ JSON FILE
// ================================

function readInitiatives(){

  delete require.cache[
    require.resolve("./initiatives.json")
  ];


  return require("./initiatives.json");

}





// ================================
// GET ALL INITIATIVES
// ================================

app.get("/initiatives/list",(req,res)=>{

  try{

    const initiatives = readInitiatives();


    res.json({

      initiatives,

      total: initiatives.length

    });


  }catch(error){

    res.status(500).json({

      error:error.message

    });

  }


});






// ================================
// GET SINGLE INITIATIVE
// ================================

app.get("/initiatives/:slug",(req,res)=>{


  try{


    const initiatives = readInitiatives();


    const initiative = initiatives.find(

      item => item.slug === req.params.slug

    );



    if(!initiative){

      return res.status(404).json({

        error:"Initiative not found"

      });

    }



    res.json(initiative);



  }catch(error){


    res.status(500).json({

      error:error.message

    });


  }


});







// ================================
// CREATE
// ================================

app.post("/initiatives",(req,res)=>{


try{


const initiatives = readInitiatives();


initiatives.push(req.body);


res.status(201).json(req.body);



}catch(error){

res.status(500).json({

error:error.message

});

}


});








export default app;





// LOCAL SERVER

if(process.env.NODE_ENV !== "production"){


const PORT = process.env.PORT || 3000;


app.listen(PORT,()=>{

console.log(
`Server running on ${PORT}`
);

});


}