const itemsPerPageOptions = [10, 25, 50, 100];
let currentPage = 1;
let itemsPerPage = itemsPerPageOptions[0];

function searchUserProfile() {
    const userInput = document.getElementById('userInput').value;
    if (!userInput) {
        alert('Please enter a GitHub username.');
        return;
    }

    showLoadingSpinner();

    // API endpoint for user details
    const userApiUrl = `https://api.github.com/users/${userInput}`;

    // API endpoint for public repositories of a user
    const repoApiUrl = `https://api.github.com/users/${userInput}/repos?per_page=${itemsPerPage}&page=${currentPage}`;

    // Fetch user details using Fetch API
    fetch(userApiUrl)
        .then(response => response.json())
        .then(userData => {
            // Fetch repositories using Fetch API
            return fetch(repoApiUrl)
                .then(response => response.json())
                .then(repoData => {
                    displayUser(userData);
                    displayRepositories(repoData, userData);
                    hideLoadingSpinner();
                    console.log(userData ,repoData)
                })
                .catch(repoError => {
                    console.error('Error fetching repositories:', repoError);
                    hideLoadingSpinner();
                });
        })
        .catch(userError => {
            console.error('Error fetching user details:', userError);
            hideLoadingSpinner();
        });
}

// ... (rest of the code remains unchanged)

function displayUser(userData) {
    const userContainer = document.getElementById('userContainer');
    userContainer.innerHTML ='';

    const userDiv = document.createElement('div');
    userDiv.classList.add('user-profile');

    const repoSearchDiv = document.createElement('div');
    repoSearchDiv.classList.add('repo-search-container');

    repoSearchDiv.innerHTML = `
        <input type="text" id="repoNameInput" class="search-input" placeholder="Search Repositories by Name (use exact name)...">
        <button id="repo-search" class="search-button">Search</button>
    `;

    const avatarDiv = document.createElement('div');
    avatarDiv.innerHTML = `<img src=${userData.avatar_url} alt="User Avatar" class="user-avatar">`;
    userDiv.appendChild(avatarDiv);

    const userInfoDiv = document.createElement('div');
    userInfoDiv.classList.add('user-info');
    userInfoDiv.innerHTML = `
        <p class="user-name">${userData.name || 'Name not available'}</p>
        <p>${userData.bio || 'No bio available.'}</p>
        <p class="social-wrapper">
            <img width="17px" src="./location.png" alt="link">
            ${userData.location || 'No location available.'}
        </p>
        <p class="social-wrapper">
            <img width="17px" src="./github.png" alt="link">
            <a href="${userData.html_url}" target="_blank">${userData.html_url}</a>
        </p>
    `;

    if (userData.twitter_username) {
        const twitterUrl = `https://twitter.com/${userData.twitter_username}`;
        userInfoDiv.innerHTML += `
            <p class="social-wrapper">
                <img width="17px" src="./twitter.png" alt="link">
                <a href="${twitterUrl}" target="_blank">${twitterUrl}</a>
            </p>
        `;
    } else {
        userInfoDiv.innerHTML += `
            <p class="social-wrapper">
                <img width="17px" src="./twitter.png" alt="link">
                Not available
            </p>
        `;
    }

    userDiv.appendChild(userInfoDiv);

    userContainer.appendChild(userDiv);
    userContainer.appendChild(repoSearchDiv);
}

function displayRepositories(repoData, userData) {
    const repositoriesContainer = document.getElementById('repositories');

    repositoriesContainer.innerHTML = '';
    
    const repoNameSearchButton = document.getElementById('repo-search');
    repoNameSearchButton.addEventListener('click', () => {
        filterRepositoriesByName(repoData, userData);
    });
    
    repoData.forEach(repo => {
        const repoCardDiv = document.createElement('div');
        repoCardDiv.classList.add('repo-card');

        repoCardDiv.innerHTML += `
            <div class="repo-name-wrapper">
                <p class="repo-name">${repo.name}</p>
                <a href="${repo.html_url}" target="_blank">
                    <img width="15px" src="./link.png" alt="link">
                </a>
            </div>
            <p class="repo-description">${repo.description || 'No description available.'}</p>
            <p class="repo-topics">Topic: ${repo.topics.join(', ') || 'Not specified'}</p>
        `;

        repositoriesContainer.appendChild(repoCardDiv);
    });


    // Pagination buttons
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalRepoPages = Math.ceil(userData.public_repos / itemsPerPage);

    const prevButton = createPaginationButton('Previous', () => {

        if (currentPage > 1) {
            currentPage--;
            searchUserProfile();
        }

        if(currentPage === 1) {
            prevButton.disabled = true;
        }
    });
    paginationContainer.appendChild(prevButton);

    const nextButton = createPaginationButton('Next', () => {

        if (currentPage < totalRepoPages) {
            currentPage++;
            searchUserProfile();
        }

        if(currentPage === totalRepoPages) {
            nextButton.disabled = true;
        }
    });
    paginationContainer.appendChild(nextButton);

    // Items per page options
    const itemsPerPageSelect = document.createElement('select');
    itemsPerPageSelect.addEventListener('change', (event) => {
        itemsPerPage = parseInt(event.target.value);
        currentPage = 1;
        searchUserProfile();
    });

    itemsPerPageOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.text = option;
        itemsPerPageSelect.appendChild(optionElement);
    });

    itemsPerPageSelect.value = itemsPerPage;
    paginationContainer.appendChild(itemsPerPageSelect);
}

function createPaginationButton(text, clickHandler) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('pagination-button');
    button.addEventListener('click', clickHandler);
    return button;
}

function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('content').style.display = 'none';
}

function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}

// Function for filtering repositories by name
function filterRepositoriesByName(repoData, userData) {
    const repoNameInput = document.getElementById('repoNameInput');
    const filterValue = repoNameInput.value.toLowerCase();
    const filteredRepos = repoData.filter(repo => repo.name.toLowerCase().includes(filterValue));
    displayRepositories(filteredRepos, userData);
}
