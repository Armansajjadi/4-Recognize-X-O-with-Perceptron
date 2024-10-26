let weights = []

let alfa = 0.5

let teta = 0.3

let dataForTrain = []

let b = null

window.addEventListener("load", () => {
    focused();

    fetch('trainData.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('File not found');
            }
            return response.json();
        })
        .then(data => {
            console.log("Data exists, returning 1");
            console.log("Weights:", data.weights);
            console.log("b:", data.b);

            // داده‌ها را به متغیرها اختصاص بده
            weights = data.weights;
            b = data.b;

            // تغییر نمایش دکمه‌ها
            btnsAboutTrainSection.classList.add("hidden");
            btnSecSabt.classList.remove("hidden");
        })
        .catch(error => {
            // اگر فایل JSON پیدا نشد یا خطایی رخ داد
            console.log("No data found or error occurred, returning 0");
            console.error(error);

            // فراخوانی تابع مقداردهی اولیه یا عملیات مورد نظر
            megdarDehi();
        });
});


function showModal(message) {
    const modal = document.getElementById('blue-modal');
    const modalMessage = document.getElementById('modal-message');

    // Set the message
    modalMessage.textContent = message;

    // Display the modal
    modal.style.display = 'block';

    // Add animation for showing the modal
    modal.style.animation = 'fadeIn 0.5s ease';

    // Automatically close the modal after 3 seconds
    setTimeout(() => {
        closeModal(modal);
    }, 1500); // 3000 milliseconds = 3 seconds
}

// Function to close the modal
function closeModal(modal) {
    // Add animation for closing the modal
    modal.style.animation = 'fadeOut 0.5s ease';
    modal.style.display = 'none';

}



function megdarDehi() {
    for (let i = 0; i < 25; i++) {
        weights.push(0)
    }
    b = 0
}

const recognizeBtn = document.getElementById("recognizeBtn")

const btnsAboutTrainSection = document.getElementById("btnsAboutTrainSection")

const doneTrainBtn = document.getElementById("doneTrainBtn")

const btnSecSabt = document.getElementById("btnSecSabt")

let btns = document.querySelectorAll(".btn")

let subO = document.getElementById("subO")
let subX = document.getElementById("subX")

function focused() {
    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.id == "onactive") {
                btn.classList.replace("bg-blue-500", "bg-rose-500")
                btn.classList.replace("hover:bg-blue-700", "hover:bg-rose-700")
                btn.id = "active"
            }
            else if (btn.id == "active") {
                btn.classList.replace("bg-rose-500", "bg-blue-500")
                btn.classList.replace("hover:bg-rose-700", "hover:bg-blue-700")
                btn.id = "onactive"
            }
        })
    })
}

subO.addEventListener("click", () => {
    saveMatrix(-1)
})

subX.addEventListener("click", () => {
    saveMatrix(+1)
})


function saveMatrix(marker) {
    const flag = Array.from(btns).some(btn => btn.id === "active");
    if (flag) {
        let data = [];

        btns.forEach(btn => {
            if (btn.id === "active") {
                data.push(1); // دکمه فعال
            } else {
                data.push(-1); // دکمه غیرفعال
            }
        });

        saveData(data, marker)

        btns.forEach(btn => {
            if (btn.id == "active") {
                btn.classList.replace("bg-rose-500", "bg-blue-500")
                btn.classList.replace("hover:bg-rose-700", "hover:bg-blue-700")
                btn.id = "onactive"
            }
        })
    } else {
        showModal("you should make a X or O first!")
    }
}

function saveData(data, y) {
    let dataObj = {
        data: data,
        y: y
    }

    dataForTrain.push(dataObj);

}

doneTrainBtn.addEventListener("click", () => {

    let yNetInput = null

    let ykoll = null

    let index = null

    let oldWeights = []

    let epoch = 0

    let training = true
    while (training) {

        oldWeights = [...weights]

        for (let item of dataForTrain) {
            yNetInput = 0;  // در هر بار محاسبه باید yNetInput صفر شود
            index = 0
            for (let x of item.data) {
                yNetInput += weights[index] * x
                index++
            }
            yNetInput += b
            if (yNetInput > teta) {
                ykoll = 1
            } else if (yNetInput <= teta && yNetInput >= ((-1) * teta)) {
                ykoll = 0
            } else if (yNetInput < ((-1) * teta)) {
                ykoll = -1
            }

            if (ykoll != item.y) {
                let i = 0
                item.data.forEach((x) => {
                    weights[i] += alfa * x * item.y
                    i++;
                });
                b += item.y;
            }
        }

        if (arraysEqual(weights, oldWeights)) {
            training = false;
        }

        epoch++
    }
    console.log("epoch :", epoch);
    // ساختن شیء داده‌ها
    const data = {
        weights: weights,
        b: b
    };

    // تبدیل داده‌ها به JSON
    const jsonData = JSON.stringify(data);

    // ساخت Blob برای ذخیره داده‌های JSON در یک فایل
    const blob = new Blob([jsonData], { type: 'application/json' });

    // ایجاد یک URL برای فایل Blob
    const url = URL.createObjectURL(blob);

    // ایجاد یک عنصر <a> برای دانلود فایل JSON
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trainData.json';  // نام فایلی که دانلود می‌شود
    document.body.appendChild(a);
    a.click();

    // حذف لینک از DOM
    document.body.removeChild(a);

    // آزاد کردن URL Object
    URL.revokeObjectURL(url);

    console.log("Data has been saved as JSON file!");

    btnsAboutTrainSection.classList.add("hidden");
    btnSecSabt.classList.remove("hidden");


});

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

recognizeBtn.addEventListener("click", () => {
    console.log('ok');
    let infoes = []
    const flag = Array.from(btns).some(btn => btn.id === "active");
    console.log(flag);
    let index = 0
    let netInput = null
    let sum = 0
    if (flag) {
        btns.forEach(btn => {
            if (btn.id === "active") {
                infoes.push(1); // دکمه فعال
            } else {
                infoes.push(-1); // دکمه غیرفعال
            }
        })
        infoes.forEach(info => {
            sum += weights[index] * info
            index++
        })
        netInput = b + sum
        if (netInput > teta) {
            showModal("it is a X")
        } else if (netInput <= teta && netInput >= ((-1) * teta)) {
            showModal("can't recognize :(")
        } else if (netInput < ((-1) * teta)) {
            showModal("it is a O")
        }
        setTimeout(() => {
            btns.forEach(btn => {
                if (btn.id == "active") {
                    btn.classList.replace("bg-rose-500", "bg-blue-500")
                    btn.classList.replace("hover:bg-rose-700", "hover:bg-blue-700")
                    btn.id = "onactive"
                }
            })
        }, 1500)
    } else {
        showModal("you should make a X or O first")
    }
})

