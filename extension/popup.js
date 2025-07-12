const addFriendButton = document.getElementById("addFriend");
const Refresh = document.getElementById("refresh");

const usernameInput = document.getElementById("username");
const friendList = document.getElementById("friendList");
const modeButton = document.getElementById("mode");

// Fetch friend data and render it
async function fetchFriendData(username) {
  try {
    const response = await fetch(` http://localhost:3000/profile/ ${username}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // console.error("Error fetching friend data:", error);
    return null;
  }
}

// Save to local storage
function saveFriend(friend) {
  chrome.storage.local.get({ friends: [] }, (result) => {
    const friends = result.friends;
    const index = friends.findIndex((f) => f.username === friend.username);

    if (index !== -1) {
      // Update existing friend's data
      friends[index] = friend;
    } else {
      // Add new friend
      friends.push(friend);
    }

    chrome.storage.local.set({ friends }, () => {
      renderFriends();
    });
  });
}

// Delete friend
function deleteFriend(username) {
  chrome.storage.local.get({ friends: [] }, (result) => {
    const friends = result.friends.filter(
      (friend) => friend.username !== username
    );
    chrome.storage.local.set({ friends });
    renderFriends();
  });
}

// Render friend list
function renderFriends() {
  chrome.storage.local.get({ friends: [] }, (result) => {
    // Clear the existing content
    friendList.innerHTML = "";

    // alert("render called");
    // Create a table element
    const table = document.createElement("table");
    table.setAttribute("border", "1");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    // Add table headers
    const headers = [
      "Username",
      "Name",
      "Rating",
      "Stars",
      "Contests",
      "Global Rank",
      "Actions",
    ];
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      th.style.padding = "8px";
      th.style.textAlign = "left";
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const sortedFriends = result.friends.sort((a, b) => b.rating - a.rating);
    // Add table rows for each friend
    const tbody = document.createElement("tbody");
    sortedFriends.forEach((friend) => {
      let isUsername = true;
      const row = document.createElement("tr");
      tbody.className = "data-body";

      const values = [
        friend.username,
        friend.name,
        friend.rating,
        friend.stars,
        friend.ContestParticipated,
        friend.GlobalRank,
      ];

      values.forEach((value) => {
        const td = document.createElement("td");
        if (isUsername) {
          let x = document.createElement("a");
          x.href = `https://www.codechef.com/users/${value}`;
          x.textContent = value;
          x.target = "_blank";
          td.appendChild(x);
          isUsername = false;
        } else td.textContent = value;
        row.appendChild(td);
      });

      // Add delete button
      const actionTd = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("deletebtn");
      deleteButton.textContent = "Delete";

      deleteButton.addEventListener("click", () =>
        deleteFriend(friend.username)
      );

      actionTd.appendChild(deleteButton);
      row.appendChild(actionTd);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    friendList.appendChild(table);
  });
}

// Add friend event
addFriendButton.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  if (username) {
    // Disable the Add button and change its text to "Adding..."
    addFriendButton.disabled = true;
    addFriendButton.textContent = "Adding...";

    const friend = await fetchFriendData(username);
    if (friend) {
      saveFriend(friend);
      usernameInput.value = "";
    } else {
      alert("Error: Could not fetch user data.");
      usernameInput.value = "";
    }

    // Re-enable the Add button and change its text back to "Add"
    addFriendButton.disabled = false;
    addFriendButton.textContent = "Add";
  }
});
Refresh.addEventListener("click", async () => {
  Refresh.disabled = true;
  Refresh.textContent = "Refreshing...";

  try {
    const result = await new Promise((resolve) => {
      chrome.storage.local.get({ friends: [] }, resolve);
    });

    for (const friend of result.friends) {
      const username = friend.username;
      const data = await fetchFriendData(username);
      if (data) {
        await new Promise((resolve) => {
          saveFriend(data);
          resolve();
        });
        usernameInput.value = "";
      } else {
        alert("Error: Could not fetch user data.");
      }
    }

    renderFriends();
  } catch (error) {
    console.error(error);
  } finally {
    Refresh.disabled = false;
    Refresh.textContent = "Refresh";
  }
});
// Select the dark mode button

// Add event listener for dark mode toggle
modeButton.addEventListener("click", () => {
  const body = document.getElementById("body");

  // Toggle the dark-mode class on the body element
  body.classList.toggle("dark-mode");

  // Update the button text
  if (body.classList.contains("dark-mode")) {
    modeButton.textContent = "Light";
  } else {
    modeButton.textContent = "Dark";
  }
});

// Initial render
document.addEventListener("DOMContentLoaded", renderFriends);
