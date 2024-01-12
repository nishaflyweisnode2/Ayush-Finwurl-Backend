const User = require("./../../models/User");

const send_all_agents = async (req, res) => {
  try {
    const all_users = await User.find({});
    if (!all_users) {
      res.status(404).json({ message: "No users found in the database" });
    } else {
      res.status(200).json(all_users);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const agent_loans = async (req, res)=> {
  try {
    const { id } = req.params;
    const agent = await User.findOne({_id: id});
    
    if (!agent) {
      res.status(404).json({message: "No such agent found"})
    }
    else {
      res.status(200).json(agent)
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Something went wrong!"})
  }
}
module.exports = {
  send_all_agents,
  agent_loans
};
