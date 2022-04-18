const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const jwtAuthz = require('express-jwt-authz');
var ManagementClient = require('auth0').ManagementClient;
const bodyParser = require('body-parser');
require('dotenv').config()

const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = process.env.appOrigin || `http://localhost:${appPort}`;

if (
  !process.env.domain ||
  !process.env.audience ||
  process.env.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that env is in place and populated with valid domain and audience values", process.env.domain, process.env.audience
  );

  process.exit();
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));
app.use(express.json());

var auth0Client = new ManagementClient({
  domain: process.env.domain,
  clientId: process.env.ClientId,
  clientSecret: process.env.ClientSecret,
  scope: 'update:users_app_metadata'
});

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.domain}/.well-known/jwks.json`,
  }),

  audience: process.env.audience,
  issuer: `https://${process.env.domain}/`,
  algorithms: ["RS256"],
});

const checkScopes = jwtAuthz([ 'create:order' ]);

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
  });
});

app.post("/api/order", checkJwt, checkScopes, async (req, res) => {
  
  const customerId = { id: req.user.sub };
  const orderTime = new Date()
  const order = Object.assign(req.body, {orderTime})

  let ordersHistory = await auth0Client.getUser({customerId}).then(user => user[0].app_metadata || {})

    let namespacedata = ordersHistory.pizza42 ?? { orders: [] }
    namespacedata.orders.push(order)
    ordersHistory.pizza42 = namespacedata

  let resp = await auth0Client.updateAppMetadata(customerId, ordersHistory);

  if(resp.error){
    res.status(400).send({
      msg: "Something went wrong"
    });
  }

  res.send({
    msg: "Your order was successful, your " + order.pizzaOrder + ' Pizza will be ready shortly',
  });

});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
