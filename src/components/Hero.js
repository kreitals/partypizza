import React from "react";

import logo from "../assets/pizzaman.svg";

const Hero = () => (
  <div className="text-center hero my-5">
    <img className="mb-3" src={logo} alt="Pizza 42 logo" width="220" />
    <h1 className="mb-4">Pizza 42</h1>

    <p className="lead" >
      Home to the world famous 42" Pizzas, so big you can only order one!
    </p>
  </div>
);

export default Hero;
