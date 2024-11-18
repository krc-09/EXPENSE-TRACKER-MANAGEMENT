const getAddExpenses = (req, where) => {
    return req.user.getExpenses(where);
  }
  
  module.exports = {
    getAddExpenses
  }
  