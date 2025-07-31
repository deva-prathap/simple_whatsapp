class Loan {
  constructor(company_name, loan_amount, due_date) {
    this.company_name = company_name;
    this.loan_amount = loan_amount;
    this.due_date = due_date;
  }

  static async create(company_name, loan_amount, due_date) {
    const [result] = await db.query(
      'INSERT INTO loans (company_name, loan_amount, due_date) VALUES (?, ?, ?)',
      [company_name, loan_amount, new Date(due_date)]
    );
    return result.insertId;
  }

  // static async findAll() {
  //   const [loans] = await db.query('SELECT * FROM loans ORDER BY due_date');
  //   return loans;
  // }

  static async findAll() {
    const [loans] = await db.query(
      'SELECT * FROM loans WHERE deleted = "0" ORDER BY due_date'
    );
    return loans;
  }

}

module.exports = Loan;