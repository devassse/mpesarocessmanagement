const setSet = () => {
  const myArray = [
    {
      "id": "1733017632080_787532",
      "type": "signature",
      "content": "Signature",
      "from": "current_user",
      "position": {
          "x": 27,
          "y": 18
      },
      "data": {
          "type": "signature",
          "content": "Signature",
          "from": "current_user"
      }
  }
  ];

  const pageSet = new Map();

  if (myArray.length > 0) {
    for (let page = 0; page < 5; page++) {
      pageSet.set(page + 1, [...myArray]); // Create new array copy for each page
    }
  }

  return pageSet;
};


export default setSet
