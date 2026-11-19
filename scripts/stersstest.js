/* eslint-disable no-plusplus */
// load-test.js
const URL = 'http://localhost:3007/api/test'; // change to your API endpoint
const TOTAL_REQUESTS = 4000;

async function makeRequest(id) {
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imei: '123456789012345',
        timestamp: '25/9/9,9:9:37+20',
        signal_strength: 3,
        adc_channels: {
          A0: 10, // extranal voltage
          A1: 5, // battry level
          A2: 5, // zone 1
          A3: 2, // pump panel mode
          A4: 5, // line pressur
          A5: 2, // pressure switch
          A6: 5, // desil pump battery
          A7: 10, // under groud tank level
          A8: 10, // disal tank level
          A10: 202, // vr
          A11: 3.23, // ar
          A12: 202, // vy
          A13: 3.23, // ay
          A14: 202, // vb
          A15: 3.23, // ab
        },

      }),
    });
    console.log(`✅ Request ${id} - ${res.status}`);
  } catch (err) {
    console.error(`❌ Request ${id} - ${err.message}`);
  }
}

async function runLoadTest() {
  console.log(`🚀 Sending ${TOTAL_REQUESTS} requests at once...`);

  const startTime = Date.now();
  const requests = [];
  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    requests.push(makeRequest(i));
  }

  const endTime = Date.now();

  await Promise.allSettled(requests);

  const responseTime = Date.now();

  console.log(`🎯 total api calls in ${TOTAL_REQUESTS} in ${endTime - startTime}ms`);
  console.log(`🎯 Load test finished in ${responseTime - endTime}ms`);

  console.log('🎯 Load test finished!');
}

runLoadTest();
