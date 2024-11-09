let weights = []

const minWeightChangeThreshold = 69.4; // Minimal weight change to stop training
let alfa = 0.1; // Slightly higher learning rate for faster convergence
let teta = 0.1; // Threshold // کاهش آستانه برای حساسیت بیشتر

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

            weights = data.weights;
            b = data.b;
            test(weights, b);

            btnsAboutTrainSection.classList.add("hidden");
            btnSecSabt.classList.remove("hidden");
        })
        .catch(error => {
            console.log("No data found or error occurred, returning 0");
            console.error(error);

        });
});

function test(ws, bias) {
    let netInput = null
    let sum = 0
    let index = 0
    let javab = 0
    let counter = 0
    fetch("testDataSets.json")
        .then(res => res.json())
        .then(array => {
            array.forEach(item => {
                item.data = item.data.flat();
            });
            array.forEach(item => {
                index = 0
                sum=0
                item.data.forEach(info => {
                    sum += ws[index] * info
                    index++
                })
                netInput = bias + sum;
                if (netInput > teta) {
                    javab = 1
                } else if (netInput < -teta) {
                    javab = -1
                } else {
                    javab = 0
                }
                if (javab == item.y) {
                    counter++
                }
            })
            const accuracyValue=document.getElementById("accuracyValue")
            accuracyValue.innerHTML=`${((counter / array.length) * 100).toFixed(2)}%`
        })
}


function showModal(message) {
    const modal = document.getElementById('blue-modal');
    const modalMessage = document.getElementById('modal-message');

    modalMessage.textContent = message;

    modal.style.display = 'block';

    modal.style.animation = 'fadeIn 0.5s ease';

    setTimeout(() => {
        closeModal(modal);
    }, 1500);
}

function closeModal(modal) {
    modal.style.animation = 'fadeOut 0.5s ease';
    modal.style.display = 'none';

}



const recognizeBtn = document.getElementById("recognizeBtn")

const btnsAboutTrainSection = document.getElementById("btnsAboutTrainSection")

const doneTrainBtn = document.getElementById("doneTrainBtn")

const btnSecSabt = document.getElementById("btnSecSabt")

let btns = null

let subO = document.getElementById("subO")
let subX = document.getElementById("subX")

function focused() {
    const btnContainer = document.getElementById("btnContainer");

    // Generate buttons and set their initial IDs
    for (let i = 0; i < 25; i++) {
        btnContainer.insertAdjacentHTML(
            "beforeend",
            `<button id="onactive" class="btn bg-blue-500 dark:bg-blue-600 hover:bg-blue-700 text-white font-semibold p-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"></button>`
        );
    }

    // Select all buttons
    btns = document.querySelectorAll(".btn");

    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.id === "onactive") {
                // Change classes for active state
                btn.classList.replace("bg-blue-500", "bg-rose-500");
                btn.classList.replace("dark:bg-blue-600", "dark:bg-rose-700");
                btn.classList.replace("hover:bg-blue-700", "hover:bg-rose-800");
                btn.id = "active"; // Change ID to active
            } else if (btn.id === "active") {
                // Revert classes to inactive state
                btn.classList.replace("bg-rose-500", "bg-blue-500");
                btn.classList.replace("dark:bg-rose-700", "dark:bg-blue-600");
                btn.classList.replace("hover:bg-rose-800", "hover:bg-blue-700");
                btn.id = "onactive"; // Change ID back to onactive
            }
        });
    });
}


doneTrainBtn.addEventListener("click", () => {
    fetch("trainDataSets.json").then(res => res.json()).then(array => {
        dataForTrain = array.map(item => ({ ...item, data: item.data.flat() }));
        weights = Array(25).fill(Math.random() * 0.01); // Random initialization of weights
        b = 0;
        let epoch = 0;
        let training = true;

        while (training) {
            let totalWeightChange = 0; // Accumulate all weight changes for this epoch
        
            for (let item of dataForTrain) {
                let yNetInput = weights.reduce((acc, w, idx) => acc + w * item.data[idx], b);
                let ykoll = yNetInput > teta ? 1 : yNetInput < -teta ? -1 : 0;
        
                if (ykoll !== item.y) {
                    item.data.forEach((x, idx) => {
                        let deltaWeight = alfa * x * item.y;
                        weights[idx] += deltaWeight;
                        totalWeightChange += Math.abs(deltaWeight); // Sum up the absolute weight changes
                    });
                    let deltaBias = alfa * item.y;
                    b += deltaBias;
                    totalWeightChange += Math.abs(deltaBias); // Include bias change in the total
                }
            }
        
            console.log(`Epoch: ${epoch}, Total Weight Change: ${totalWeightChange}`);
        
            // Stop if total weight change is below the threshold, indicating convergence
            if (totalWeightChange < minWeightChangeThreshold) {
                training = false;
                console.log("Converged: No significant weight changes in this epoch.");
            }
        
            epoch++;
        }

        console.log("Total Epochs:", epoch);

        const data = { weights, b };
        const jsonData = JSON.stringify(data);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trainData.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log("Data has been saved as JSON file!");
        btnsAboutTrainSection.classList.add("hidden");
        btnSecSabt.classList.remove("hidden");
    });
});


recognizeBtn.addEventListener("click", () => {
    let infoes = []
    const flag = Array.from(btns).some(btn => btn.id === "active");
    let index = 0
    let netInput = null
    let sum = 0
    if (flag) {
        btns.forEach(btn => {
            if (btn.id === "active") {
                infoes.push(1);
            } else {
                infoes.push(-1);
            }
        })
        infoes.forEach(info => {
            sum += weights[index] * info
            index++
        })
        netInput = b + sum
        // console.log(netInput);
        if (netInput > teta) {
            showModal("it is a X");
        } else if (netInput < -teta) {
            showModal("it is a O");
        } else {
            showModal("can't recognize :(");
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

