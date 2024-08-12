document.body.style.backgroundImage = `url(${localStorage.getItem(
  "backgroundImage"
)})`;
document.getElementById("logo").src = localStorage.getItem("logo");

async function verifyCode() {
  const verificationCode = document.getElementById("verificationCode").value;
  const phoneNumber = localStorage.getItem("phoneNumber");

  try {
    const response = await fetch("/verify/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phoneNumber,
        code: verificationCode,
      }),
    });

    const result = await response.json();

    if (result.success) {
      alert("Verification successful!");
      location.href = "dashboard.html";
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    alert(`Unexpected error: ${error.message}`);
  }
}
