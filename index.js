const express= require("express")
const axios = require('axios')
const app = express();
const PORT = 6060;

const fetchApiData =async(species)=>{
    const apiResponse = await axios.get(
        `https://www.fishwatch.gov/api/species/${species}`
    );
    console.log("Request sent to the API")
    console.log(apiResponse.data)
    return apiResponse.data
}

const getSpeciesData=async(req,res)=>
{
    const species = req.params.species;
  let results;

  try {
    results = await fetchApiData(species);
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


app.get("/fish/:species", getSpeciesData);

app.listen(PORT,()=>{
    console.log('server is running')
})