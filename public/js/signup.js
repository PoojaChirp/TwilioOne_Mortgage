async function signup() {
  const phoneNumber = document.getElementById("phoneNumber").value;
  const email = document.getElementById("email").value;

  try {
    const response = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        email,
      }),
    });

    // Check if the response is okay
    if (!response.ok) {
      // Try to parse JSON error response
      const errorData = await response.json();
      alert(`Error: ${errorData.error}`);
    } else {
      const result = await response.json();

      if (result.success) {
        alert("Sign up successful! Verification code sent.");
        localStorage.setItem("phoneNumber", phoneNumber);
        location.href = "verify.html";
      } else {
        alert(`Error: ${result.error}`);
      }
    }
  } catch (error) {
    alert(`Unexpected error: ${error.message}`);
  }
}

// Lookup validation
async function lookup() {
  const phoneNumber = document.getElementById("phoneNumber").value;
  const firstName = document.getElementById("fname").value;
  const lastName = document.getElementById("lname").value;
  const address = document.getElementById("address").value;

  const response = await fetch("/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const resultDiv = document.getElementById("result");
      if (data.error) {
        resultDiv.textContent = "Error: " + data.error;
      } else {
        resultDiv.textContent = `Phone Number: ${data.phoneNumber}, Line Type: ${data.lineTypeIntelligence}, Device Type: ${data.deviceType}, Identity Matched: ${data.identityMatch}`;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("result").textContent =
        "An error occurred. Please try again.";
    });
}
