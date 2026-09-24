import { alertMessage } from "../js/utils.mjs";

const checkoutSubmit = document.querySelector("#checkoutSubmit");

if (checkoutSubmit) {
  checkoutSubmit.addEventListener("click", (e) => {
    e.preventDefault();
    const myForm = document.forms[0];
    
    // HTML Validation Check
    const chkStatus = myForm ? myForm.checkValidity() : false;
    if (myForm) {
      myForm.reportValidity();
    }

    if (chkStatus) {
      try {
        // Clear local storage cart on success
        localStorage.removeItem("so-cart");
        window.location.href = "./success.html";
      } catch (err) {
        document.querySelectorAll(".alert").forEach((alert) => alert.remove());
        alertMessage("There was an error processing your order. Please try again.");
      }
    } else {
      document.querySelectorAll(".alert").forEach((alert) => alert.remove());
      alertMessage("Please fill in all required fields correctly before submitting.");
    }
  });
}