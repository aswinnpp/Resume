



const loadHome = async (req, res) => {
    try {
      console.log("loadHome controller running");
      res.render("user/home");
    } catch (error) {
      console.error("Error in loadHome:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  



module.exports = { loadHome   }
  