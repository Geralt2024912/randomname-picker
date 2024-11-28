document.addEventListener('DOMContentLoaded', () => {
    const nameDisplay = document.getElementById('nameDisplay');
    const pickButton = document.getElementById('pickButton');
    const pickSound = document.getElementById('pickSound');
    const nameList = document.getElementById('nameList');
    let isAnimating = false;

    // Store the original names for restart functionality
    let originalNames = [];
    let remainingNames = [];
    let pickedNames = [];

    // Add restart button to HTML dynamically
    const restartButton = document.createElement('button');
    restartButton.id = 'restartButton';
    restartButton.textContent = 'Restart';
    restartButton.style.display = 'none'; // Hide initially
    pickButton.parentNode.insertBefore(restartButton, nameList.parentNode);

    // Initialize the names
    function initializeNames() {
        originalNames = nameList.value.split('\n').filter(name => name.trim() !== '');
        remainingNames = [...originalNames];
        updateButtonsVisibility();
    }

    // Update buttons visibility based on remaining names
    function updateButtonsVisibility() {
        pickButton.style.display = remainingNames.length > 0 ? 'inline-block' : 'none';
        restartButton.style.display = remainingNames.length < originalNames.length ? 'inline-block' : 'none';

        // Update textarea with remaining names
        nameList.value = remainingNames.join('\n');
    }

    // Initialize on load and when textarea changes
    initializeNames();
    nameList.addEventListener('input', initializeNames);

    pickButton.addEventListener('click', () => {
        if (isAnimating) return;

        // Play sound when button is clicked
        pickSound.currentTime = 0;  // Reset sound to start
        pickSound.play();

        if (remainingNames.length === 0) {
            nameDisplay.textContent = 'No more names left!';
            return;
        }

        isAnimating = true;
        pickButton.disabled = true;

        // Quick shuffle animation for 3 seconds
        let shuffleCount = 0;
        const shuffleInterval = setInterval(() => {
            nameDisplay.querySelector('.name-text').textContent =
                remainingNames[Math.floor(Math.random() * remainingNames.length)];
            shuffleCount++;

            if (shuffleCount === 15) {  // Changed to make it last 3 seconds
                clearInterval(shuffleInterval);
                finalPick();
            }
        }, 200);  // Changed to 200ms (15 × 200ms = 3000ms total)

        function finalPick() {
            // Randomly select from remaining names
            const randomIndex = Math.floor(Math.random() * remainingNames.length);
            const selectedName = remainingNames[randomIndex];

            // Add to picked names array and update display
            pickedNames.push(selectedName);
            updatePickedNamesList();

            // Remove from remaining names
            remainingNames.splice(randomIndex, 1);

            nameDisplay.querySelector('.name-text').textContent = selectedName;
            nameDisplay.classList.add('animate');

            setTimeout(() => {
                nameDisplay.classList.remove('animate');
                isAnimating = false;
                pickButton.disabled = false;
                updateButtonsVisibility();
            }, 2000);
        }
    });

    // Restart button functionality
    restartButton.addEventListener('click', () => {
        // Reset remaining names
        initializeNames();

        // Clear picked names array
        pickedNames = [];

        // Clear the picked names display
        const pickedNamesList = document.getElementById('pickedNamesList');
        pickedNamesList.innerHTML = '';

        // Reset name display
        nameDisplay.querySelector('.name-text').textContent = 'Click to Pick!';
        nameDisplay.classList.remove('animate');

        // Show pick button, hide restart button
        pickButton.style.display = 'block';
        restartButton.style.display = 'none';
    });

    // Add keyboard event listener for space bar
    document.addEventListener('keydown', (event) => {
        // Check if it's space key and button is visible and not disabled
        if (event.code === 'Space' &&
            pickButton.style.display !== 'none' &&
            !pickButton.disabled) {
            event.preventDefault(); // Prevent page scrolling
            pickSound.currentTime = 0;
            pickSound.play();
            pickButton.classList.add('active'); // Add pressed effect
            pickButton.click(); // Trigger the pick button click
        }
    });

    // Remove the pressed effect when space is released
    document.addEventListener('keyup', (event) => {
        if (event.code === 'Space') {
            pickButton.classList.remove('active');
        }
    });

    // Add keyboard event listener for Escape key
    document.addEventListener('keydown', (event) => {
        // Check if it's Escape key and restart button is visible
        if (event.code === 'Escape' &&
            restartButton.style.display !== 'none') {
            event.preventDefault();

            // Clear picked names array
            pickedNames = [];

            // Clear the picked names display
            const pickedNamesList = document.getElementById('pickedNamesList');
            pickedNamesList.innerHTML = '';

            restartButton.click();
        }
    });

    const muteButton = document.getElementById('muteButton');
    let isMuted = false;

    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        pickSound.muted = isMuted;
        muteButton.textContent = isMuted ? '🔇' : '🔊';

        // Add a little animation
        muteButton.style.transform = 'scale(1.2)';
        setTimeout(() => {
            muteButton.style.transform = 'scale(1)';
        }, 200);
    });

    // Add this new function to update the picked names display
    function updatePickedNamesList() {
        const pickedNamesList = document.getElementById('pickedNamesList');
        pickedNamesList.innerHTML = ''; // Clear current list

        pickedNames.forEach((name, index) => {
            const nameDiv = document.createElement('div');
            nameDiv.textContent = `${index + 1}. ${name}`;
            pickedNamesList.appendChild(nameDiv);
        });
    }
});