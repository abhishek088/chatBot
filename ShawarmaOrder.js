const Order = require("./Order");

const OrderState = Object.freeze({
    WELCOMING:   Symbol("welcoming"),
    TYPE:   Symbol("type"),
    DIPPINGS:   Symbol("dippings"),
    FRIES:   Symbol("fries"),
    FRIES_SIZE:   Symbol("friesSize"),
    DRINKS:  Symbol("drinks"),
    PAYMENT: Symbol("payment")
});

module.exports = class ShwarmaOrder extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;

        this.sType = "";
        this.sDippings = "";
        this.sFries = "";
        this.sFriesSize = "";
        this.sDrinks = "";
        this.sItem = "burger";
        this.sItem2 = "fries";
        this.total = 0;
    }
    handleInput(sInput){
        let aReturn = [];
        let isFries = false;
        switch(this.stateCur){
            case OrderState.WELCOMING:
                this.stateCur = OrderState.TYPE;
                aReturn.push("Welcome to Abhishek's Burger place.");
                aReturn.push("Which burger would you like to have today? (Chicken / Ham / Beef)");
                break;
            case OrderState.TYPE:
                if (sInput == "Chicken" || sInput == "chicken"){
                    this.stateCur = OrderState.DIPPINGS
                    this.sType = sInput;
                    this.total = 5;
                    aReturn.push("Which dippings would you like?");
                }
                else if (sInput == "Ham" || sInput == "ham"){
                    this.stateCur = OrderState.DIPPINGS
                    this.sType = sInput;
                    this.total = 6;
                    aReturn.push("Which dippings would you like?");
                }
                else if (sInput == "Beef" || sInput == "beef"){
                    this.stateCur = OrderState.DIPPINGS
                    this.sType = sInput;
                    this.total = 7;
                    aReturn.push("Which dippings would you like?");
                }
                else {
                  aReturn.push ("Please select CHICKEN / HAM / BEEF");
                }
                break;
            case OrderState.DIPPINGS:
                this.stateCur = OrderState.FRIES
                this.sDippings = sInput;
                aReturn.push("Would you like to have fries with that?");
                break;
            case OrderState.FRIES:
                this.sFries = sInput;
                if(sInput == "no" || sInput == "No" || sInput == "NO" ){ 
                    this.stateCur = OrderState.DRINKS        
                    aReturn.push("Would you like drinks with your food?");
                }
                else{
                    this.stateCur = OrderState.FRIES_SIZE
                    aReturn.push("What should the size of the fries be? (Large / Medium / Small)");
                    isFries = true;
                }
                break;
            case OrderState.FRIES_SIZE:
                if (sInput == "Large" || sInput == "large"){
                    this.stateCur = OrderState.DRINKS
                    this.sFriesSize = sInput;
                    this.total += 5;
                    aReturn.push("Would you like drinks with your food?");
                }
                else if (sInput == "Medium" || sInput == "medium"){
                    this.stateCur = OrderState.DRINKS
                    this.sFriesSize = sInput;
                    this.total += 3;
                    aReturn.push("Would you like drinks with your food?");
                }
                else if (sInput == "Small" || sInput == "small"){
                    this.stateCur = OrderState.DRINKS
                    this.sFriesSize = sInput;
                    this.total += 2;
                    aReturn.push("Would you like drinks with your food?");
                }
                else {
                  aReturn.push("Please select LARGE/ MEDIUM / SMALL")
                }
                break;
            case OrderState.DRINKS:
                this.stateCur = OrderState.PAYMENT;
                this.isDone(true);
                this.sDrinks = sInput;
                if(sInput == "no" || sInput == "No" || sInput == "NO"){         
                    aReturn.push(`Thank-you for your order of ${this.sType} ${this.sItem} with ${this.sDippings}`);
                }
                else if(sInput == "no" || sInput == "No" || sInput == "NO" && isFries){
                    aReturn.push(`Thank-you for your order of ${this.sType} ${this.sItem} with ${this.sDippings} and ${this.sFriesSize} ${this.sItem2}`);
                }
                else if (isFries){
                    aReturn.push(`Thank-you for your order of ${this.sType} ${this.sItem} with ${this.sDippings}, ${this.sFriesSize} ${this.sItem2} and ${this.sDrinks}`);
                    this.total += 3;
                }
                else{
                    aReturn.push(`Thank-you for your order of ${this.sType} ${this.sItem} with ${this.sDippings} and ${this.sDrinks}`);
                    this.total += 3;
                }
                this.nOrder = this.total;
                aReturn.push(`Your total for today is $${this.total}`);
                aReturn.push(`Please pay for your order here`);
                aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                break;
            case OrderState.PAYMENT:
                console.log(sInput);
                this.isDone(true);
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                aReturn.push(`Your order will be delivered at ${d.toTimeString()}`);
                aReturn.push(`Your order will be delivered to ${sInput.address_line_1}, ${sInput.admin_area_2}, ${sInput.postal_code}, ${sInput.country_code}`);
                break;
        }
        return aReturn;
    }
    renderForm(){
      // your client id should be kept private
      const sClientID = process.env.SB_CLIENT_ID || 'Ab-gDapUoAwuu5GIHm1ccqX59hypCpbabxlTPearxdQYJOd-M7D_z7KXYBappwb4y2zwsKHvn17-UtUq'
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);
  
    }
}