const geocoder = require('./utils/geocoder');

async function test() {
  const address = "MG Road";
  const pincode = "560001";
  
  const result = await geocoder.geocode(address, pincode);
  console.log('Result:', JSON.stringify(result, null, 2));
}

test();