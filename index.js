const express= require("express")
const axios = require('axios')
const app = express();
const PORT = 6060;



const fetchApiData =async(pin)=>{
    const apiResponse = await axios.get(
        `http://api.zippopotam.us/us/${pin}`
    );
    console.log("Request sent to the API")
    // console.log(apiResponse.data)
    return apiResponse.data
}

const getPinData=async(req,res)=>
{
    const pin = req.params.pin;
  let results;

  try {
    results = await fetchApiData(pin);
    if (results.length === 0) {
      throw "API returned an empty array";
    }
    res.send({
      fromCache: false,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
}


app.get("/us/:pin", getPinData);

app.listen(PORT,()=>{
    console.log('server is running')
})