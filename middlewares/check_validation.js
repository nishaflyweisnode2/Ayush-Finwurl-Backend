let arr = require("./../constants/pincode_prefr.json");

const checkValidation = async (req, res, next) => {
  console.log("hello");
  const { age, income, pincode } = req.body;
  if (age < 18 || age > 55) {
    return res.status(200).json({ message: "Age criteria doesn't meet" });
  }
  if (income < 20000) {
    return res.status(200).json({ message: "Income criteria doesn't meet" });
  }
  const pin_array = arr.pincode_array;
  function result() {
    let l = 0;
    let r = pin_array.length - 1;
    while (l <= r) {
      let mid = Math.floor((l + r) / 2);
      // console.log(pin_array[mid]);
      if (pin_array[mid] === Number(pincode)) return mid;
      if (pin_array[mid] < Number(pincode)) l = mid + 1;
      else r = mid - 1;
    }
    return -1;
  }
  const resValue = result();
  console.log(resValue);

  try {
    if (resValue !== -1) {
      next();
    } else {
      res.status(200).json({
        message: "Regional criteria doesn't meet",
      });
    }
  } catch (e) {
    res.status(200).json({
      message: "Regional criteria doesn't meet",
    });
  }
};

module.exports = checkValidation;
