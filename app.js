"use-strict";

//const repoSearchBtn = document.querySelector("#repoSearchBtn");
//console.log(repoSearchBtn); // might not be needed

const submitForm = document.querySelector("#repo-search-form");
console.log(submitForm);

const repoList = document.querySelector("#repo-list");
console.log(repoList);

const paginationControls = document.querySelector("#pagination");
console.log(paginationControls); // This will be used to render pagination controls

const filterBtn = document.querySelectorAll(".filter-btn");
console.log(filterBtn);

const repoResultHeading = document.querySelector(".repo-results h2");
console.log(repoResultHeading);

const baseURL = "https://api.github.com/"; // Base URL for GitHub API

let currentSearchTerm = ""; // Variable to store the current search term
let currentPage = 1; // Variable to track the current page of results
let perPage = 100; // Number of results per page
let maxPages = 5; // Variable to track the maximum number of pages

// Function to render repositories
// This function takes the search data and creates HTML elements to display the repositories
// It iterates over the items in the search data and creates a card for each repository
// Each card includes the repository owner's avatar, name, description, and a link to the repository

const renderRespostrities = (searchData) => {
  for (let data of searchData.items) {
    console.log(data.owner.avatar_url);
    console.log(data);
    console.log(data.html_url);
    console.log(data.name);
    console.log(data.description);

    const repoCard = document.createElement("div");
    repoCard.classList.add("repo-card");

    const repoheader = document.createElement("div");
    repoheader.classList.add("repo-header");

    const imgElement = document.createElement("img");
    imgElement.src = data.owner.avatar_url
      ? data.owner.avatar_url
      : "https://via.placeholder.com/150";
    imgElement.alt = "Repository Owner Avatar";
    const repoOwner = document.createElement("a");
    repoOwner.href = data.owner.html_url;
    repoOwner.target = "_blank";
    repoOwner.textContent = data.owner.login;

    const repoUrlCard = document.createElement("h3");
    const repoUrl = document.createElement("a");
    repoUrl.href = data.html_url;
    repoUrl.textContent = data.name;
    repoUrl.target = "_blank";

    const repoStars = document.createElement("span");
    repoStars.classList.add("star-count");
    const starIcon = document.createElement("i");
    starIcon.classList.add("fas", "fa-star");

    const repoDescription = document.createElement("p");
    repoDescription.classList.add("repo-description");
    repoDescription.textContent = data.description
      ? data.description
      : "No description available.";

    repoCard.append(repoheader);
    repoheader.append(imgElement, repoOwner);
    repoCard.append(repoUrlCard);
    repoUrlCard.append(repoUrl);
    repoStars.append(starIcon, `${data.stargazers_count}`);
    repoUrlCard.append(repoStars);
    repoCard.append(repoDescription);
    repoList.append(repoCard);

    // Add event listener to show the popup when the mouse is on the ImageIcon of the repoOwner
    imgElement.addEventListener("mouseenter", (event) => {
      console.log("Mouse is on the ImageIcon");
      showUserInfoPopupCard(data.owner.login, event.target);
    });

    imgElement.addEventListener("mouseleave", () => {
      hideUserInfoPopupCard();
      console.log("Mouse is away of the ImageIcon");
    });
  }
};

// Fetch one page results

const fetchRepositories = async (searchTerm, page) => {
  try {
    const searchRawData = await fetch(
      `${baseURL}search/repositories?q=${searchTerm}&sort=stars&order=desc&page=${page}&per_page=${perPage}`
    );
    console.log(searchRawData);
    const searchData = await searchRawData.json();
    console.log(searchData);
    console.log(JSON.stringify(searchData, null, 2)); // Pretty print JSON data remember
    console.log(searchData.items); // This is now an Array
    renderRespostrities(searchData);
  } catch (error) {
    console.error("Error fetching data:", error);
    repoList.innerHTML = `<p class="error">Error fetching repositories. Please try again later.</p>`;
  }
};

// Render pagination controls

const renderPaginationControls = () => {
  paginationControls.innerHTML = "";

  for (let i = 1; i <= maxPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = `Page ${i}`;
    btn.classList.add("pagination-btn");
    if (i === currentPage) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", async () => {
      currentPage = i; // Update current page
      const repos = await fetchRepositories(currentSearchTerm, currentPage); // Fetch repositories for the new page
      renderPaginationControls(); // Re-render pagination controls
    });
    paginationControls.append(btn);
  }
};

// Event listener for form submission using search input
// This listens for the submit event on the form and prevents the default behavior of reloading the page

submitForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // using this to prevent reloading of the page when the form is submitted

  const repoSearchInput = document.querySelector("#repo-search-input");
  console.log(repoSearchInput);
  const searchTerm = repoSearchInput.value.trim();
  console.log(searchTerm);

  if (!searchTerm) return; // If the search term is empty, do nothing

  currentSearchTerm = searchTerm; // Update the current search term
  currentPage = 1; // Reset to the first page

  repoList.innerHTML = ""; // Clear previous results
  repoSearchInput.value = ""; // Clear the input field

  try {
    const repos = await fetchRepositories(currentSearchTerm, currentPage);
    renderPaginationControls(); // Render pagination controls after fetching repositories
    //console.log(repos);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    repoList.innerHTML = `<p class="error">Error fetching repositories. Please try again later.</p>`;
  }
});

// Event listner for the Filter buttons (always use a for of loop to traverse through all the button in the NodeList)

for (let btn of filterBtn) {
  console.log(btn);
  btn.addEventListener("click", async () => {
    // Remove active class from all buttons Importnat rememeber to toggle between active and innactive states of button use forEach method
    filterBtn.forEach((btn) => {
      btn.classList.remove("active");
    });

    btn.classList.add("active");
    const filterdata = btn.innerText;
    console.log(filterdata);

    currentSearchTerm = filterdata.trim(); // Update the current search term
    currentPage = 1; // Reset to the first page

    repoList.innerHTML = ""; // Clear previous results
    //repoSearchInput.value = ""; // Clear the input field

    try {
      const repos = await fetchRepositories(currentSearchTerm, currentPage);
      renderPaginationControls(); // Render pagination controls after fetching repositories
      //console.log(repos);
    } catch (error) {
      console.error("Error fetching repositories:", error);
      repoList.innerHTML = `<p class="error">Error fetching repositories. Please try again later.</p>`;
    }
  });
}

// Function to rednder the trending repositories when the page loads

const renderTrendingRepositories = async () => {
  const today = new Date();
  console.log(today);
  const last30Day = new Date(today.setDate(today.getDate() - 30))
    .toISOString()
    .split("T")[0];
  console.log(last30Day);
  const searchTerm = `created:>${last30Day}`;
  console.log(searchTerm);
  currentPage = 1;
  currentSearchTerm = searchTerm; // Update the current search term
  repoList.innerHTML = ""; // Clear previous results
  repoResultHeading.innerHTML = `<span style="color: #ff5733; font-weight: bold;">🚀 Trending Repositories</span>`;
  fetchRepositories(searchTerm, currentPage);
  renderPaginationControls(); // Render pagination controls after fetching repositories
};

renderTrendingRepositories();

async function showUserInfoPopupCard(username, anchorElement) {
  const res = await fetch(`https://api.github.com/users/${username}`);
  const user = await res.json();

  const popup = document.createElement("div");
  popup.className = "user-popup";

  const avatar = document.createElement("img");
  avatar.src = user.avatar_url;
  avatar.alt = `${user.login}'s avatar`;

  const name = document.createElement("strong");
  name.textContent = user.login;

  const bio = document.createElement("p");
  bio.textContent = user.bio || "No bio provided.";

  const location = document.createElement("p");
  location.innerHTML = `📍 <span>${user.location || "Unknown"}</span>`;

  const repo = document.createElement("p");
  repo.innerHTML = `📁 <span>${user.public_repos} Repos</span>`;

  const followers = document.createElement("p");
  followers.innerHTML = `👥 <span>${user.followers} Followers</span>`;

  popup.append(avatar, name, bio, location, repo, followers);
  document.body.appendChild(popup);

  const rect = anchorElement.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;
}

function hideUserInfoPopupCard() {
  const popup = document.querySelector(".user-popup");
  if (popup) {
    popup.remove();
  }
}
