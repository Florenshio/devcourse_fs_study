function alert_login() {
    alert("조영래 : Input your Id and Password");
}

function login_success() {
    alert("조영래 : Login Success");
}

function login_if() {
    let id = document.getElementById("login_id").value;
    let pw = document.getElementById("login_pw").value;

    if (!id || !pw) {
        alert_login()
    } else {
        login_success()
    }
}