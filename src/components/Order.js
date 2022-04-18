import React, { useEffect, useState } from "react";
import { Row, Col, Alert } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { getConfig } from "../config";
import contentData from "../utils/pizzaData";

const Order = () => {
  const { apiOrigin = "http://localhost:3001" } = getConfig();

  const {
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
    user
  } = useAuth0();

  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
    lastOrder: null
  });

  useEffect(() => {
    LoadLastOrder();
  }, []);

function LoadLastOrder(){
  if (user !== undefined && user['http://pizza42.com/'] !== undefined ){
    console.log("oh no")
    setState({
          ...state,
          lastOrder: user['http://pizza42.com/']?.pizza42.orders.pop().pizzaOrder
        });
  }
}

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error
      });
    }

    await callApi();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const callApi = async (pizzaOrder) => {

    try {

      
      const token = await getAccessTokenSilently();

      console.log("pizzaOrderObject", pizzaOrder);

      const response = await fetch(`${apiOrigin}/api/order`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pizzaOrder: pizzaOrder
        })
      });
      
      const responseData = await response.json();


      setState({
        ...state,
        showResult: true,
        lastOrder: pizzaOrder,
        apiMessage: responseData,
        });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  return (
    <>
      <div className="mb-5">
        {state.error === "consent_required" && (
          <Alert variant="outlined" color="warning">
            You need to{" "}
            <a
              href="#/"
              className="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}

        {state.error === "login_required" && (
          <Alert variant="outlined" color="warning">
            You need to{" "}
            <a
              href="#/"
              className="alert-link"
              onClick={(e) => handle(e, handleLoginAgain)}
            >
              log in again
            </a>
          </Alert>
        )}

        {state.error === "email_verification_required" && (
          <Alert variant="outlined" color="warning">
            Please verify your email address
          </Alert>
        )}

        {user !== undefined && !user.email_verified && (
                <Alert color="warning">
                <p>
                Oh no! You can't order until you verify your email
                </p>

                </Alert>
        )}

        <div className="next-steps my-5">
          <h2 className="my-5 text-center">Pizza Menu</h2>
          <Row className="d-flex justify-content-between">
            {contentData.map((col, i) => (
              <Col key={i} md={5} className="mb-4">
                <img className="pizzaImage" src={col.img} alt={col.type} />
                <h6 className="mb-3">
                  {col.type}
                </h6>
                <h6>{col.price}</h6>
                <p>{col.description}</p>
                <button onClick={() => callApi(col.type)}
                className="btn-primary"
                disabled={user !== undefined && !user?.email_verified}
                >
                  Buy Now!
                </button>
              </Col>
            ))}
          </Row>
        </div>

        {console.log("user",user)}
        { user !== undefined && user['http://pizza42.com/'] !== undefined &&  (
                <div className="next-steps my-5">
                <h4 className="my-5 text-center">Welcome back! As a loyal Pizzahead get your last pizza again for only $20</h4>
                <Row className="d-flex justify-content-md-center">
                    <Col md={5} className="mb-4">
                      <img className="pizzaImage" src='https://media-public.canva.com/uv3KU/MAEBdguv3KU/1/s.svg' alt='pizza' width="220" />
                      <h6 className="mb-3">
                        {state.lastOrder}
                      </h6>
                      <h6>$20</h6>
                      <button onClick={() => callApi(state.lastOrder)}
                      className="btn-primary"
                      disabled={user !== undefined && !user?.email_verified}
                      >
                        Buy Again!
                      </button>
                    </Col>
                </Row>
              </div>
                
        )}
      </div>

      <div className="result-block-container">
        {state.showResult  && (
          <Alert variant="outlined" color="success">
              <strong>{JSON.stringify(state.apiMessage.msg, null, 2)}</strong>
          </Alert>
        )}

      </div>
    </>
  );
}

export default Order;
