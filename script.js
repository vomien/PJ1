const API_BASE_URL = "http://localhost:4000/api";
const protectedViews = new Set(["households", "residents", "contributions", "search", "settings"]);

const viewMeta = {
    home: { title: "Trang chủ", desc: "Tổng quan hệ thống quản lý hộ khẩu" },
    login: { title: "Đăng nhập", desc: "Truy cập vào hệ thống quản trị" },
    households: { title: "Quản lý hộ khẩu", desc: "Tạo và chỉnh sửa hồ sơ hộ khẩu" },
    residents: { title: "Quản lý cư dân", desc: "Liên kết cư dân với các hộ khẩu" },
    contributions: { title: "Thu phí/đóng góp", desc: "Ghi nhận và tổng hợp đóng góp" },
    search: { title: "Tìm kiếm", desc: "Tra cứu hộ khẩu, cư dân và khoản đóng góp" },
    settings: { title: "Cài đặt", desc: "Cập nhật thông tin cấu hình hệ thống" },
};

const state = {
    token: sessionStorage.getItem("hk_token") || "",
    username: sessionStorage.getItem("hk_username") || "",
    households: [],
    residents: [],
    contributions: [],
    settings: null,
    currentView: "home",
};

const navButtons = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll(".view");
const rowEmptyTemplate = document.querySelector("#row-empty").content;
const viewTitle = document.querySelector("#view-title");
const viewDesc = document.querySelector("#view-desc");
const userIndicator = document.querySelector("#user-indicator");
const logoutBtn = document.querySelector("#logout-btn");

const householdForm = document.querySelector("#household-form");
const householdTableBody = document.querySelector("#household-table-body");
const householdIdField = householdForm?.querySelector('input[name="id"]');
const householdCodeInput = document.querySelector("#household-code-input");
const householdFormTitle = document.querySelector("#household-form-title");
const householdFormDesc = document.querySelector("#household-form-desc");
const householdSubmitBtn = document.querySelector("#household-submit-btn");

const residentForm = document.querySelector("#resident-form");
const residentIdField = residentForm?.querySelector('input[name="id"]');
const residentTableBody = document.querySelector("#resident-table-body");

const contributionForm = document.querySelector("#contribution-form");
const contributionIdField = contributionForm?.querySelector('input[name="id"]');
const contributionTableBody = document.querySelector("#contribution-table-body");
const contributionTotals = document.querySelector("#contribution-totals");

const loginForm = document.querySelector("#login-form");
const searchForm = document.querySelector("#search-form");
const searchResults = document.querySelector("#search-results");
const clearSearchBtn = document.querySelector("#clear-search");

const settingsForm = document.querySelector("#settings-form");

init();

function init() {
    navButtons.forEach((btn) => {
        btn.addEventListener("click", () => switchView(btn.dataset.view));
    });

    logoutBtn.addEventListener("click", handleLogout);

    householdForm?.addEventListener("submit", handleHouseholdSubmit);
    document.querySelector("#refresh-households")?.addEventListener("click", loadHouseholds);
    document.querySelector("#reset-household-form")?.addEventListener("click", () => {
        resetHouseholdForm();
    });

    residentForm?.addEventListener("submit", handleResidentSubmit);
    document.querySelector("#refresh-residents")?.addEventListener("click", loadResidents);
    document.querySelector("#reset-resident-form")?.addEventListener("click", () => residentForm.reset());

    contributionForm?.addEventListener("submit", handleContributionSubmit);
    document.querySelector("#refresh-contributions")?.addEventListener("click", loadContributions);
    document.querySelector("#reset-contribution-form")?.addEventListener("click", () => contributionForm.reset());

    loginForm?.addEventListener("submit", handleLogin);
    searchForm?.addEventListener("submit", handleSearch);
    clearSearchBtn?.addEventListener("click", () => {
        searchForm.reset();
        searchResults.innerHTML = `<p class="empty">Nhập từ khóa để bắt đầu tìm kiếm.</p>`;
    });

    settingsForm?.addEventListener("submit", handleSettingsSubmit);

    updateAuthUI();
    switchView("home");
}

function switchView(targetView) {
    if (!targetView) return;

    if (protectedViews.has(targetView) && !state.token) {
        alert("Vui lòng đăng nhập để truy cập khu vực này.");
        targetView = "login";
    }

    state.currentView = targetView;
    navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === targetView));
    views.forEach((view) => view.classList.toggle("active", view.id === `${targetView}-view`));

    const meta = viewMeta[targetView] || viewMeta.home;
    viewTitle.textContent = meta.title;
    viewDesc.textContent = meta.desc;

    if (protectedViews.has(targetView)) {
        if (targetView === "households") {
            resetHouseholdForm();
            loadHouseholds();
        }
        if (targetView === "residents") {
            loadHouseholds();
            loadResidents();
        }
        if (targetView === "contributions") {
            loadHouseholds();
            loadContributions();
        }
        if (targetView === "search") {
            searchResults.innerHTML = `<p class="empty">Nhập từ khóa để bắt đầu tìm kiếm.</p>`;
        }
        if (targetView === "settings") {
            loadSettings();
        }
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const credentials = {
        username: formData.get("username").trim(),
        password: formData.get("password").trim(),
    };
    if (!credentials.username || !credentials.password) {
        return alert("Vui lòng nhập đầy đủ thông tin.");
    }
    try {
        const response = await apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
            includeAuth: false,
        });
        state.token = response.token;
        state.username = response.username;
        sessionStorage.setItem("hk_token", response.token);
        sessionStorage.setItem("hk_username", response.username);
        loginForm.reset();
        updateAuthUI();
        switchView("households");
    } catch (error) {
        alert(error.message);
    }
}

async function handleLogout() {
    if (!state.token) return;
    try {
        await apiFetch("/auth/logout", { method: "POST" });
    } catch (error) {
        console.warn("Logout API error:", error.message);
    } finally {
        state.token = "";
        state.username = "";
        sessionStorage.removeItem("hk_token");
        sessionStorage.removeItem("hk_username");
        updateAuthUI();
        switchView("home");
    }
}

function updateAuthUI() {
    const loggedIn = Boolean(state.token);
    userIndicator.textContent = loggedIn ? state.username : "Khách";
    logoutBtn.classList.toggle("hidden", !loggedIn);
}

async function loadHouseholds() {
    try {
        const rows = await apiFetch("/households");
        state.households = rows;
        renderHouseholds();
        populateHouseholdSelects();
    } catch (error) {
        alert(error.message);
    }
}

function renderHouseholds() {
    householdTableBody.innerHTML = "";
    if (!state.households.length) {
        return householdTableBody.append(rowEmptyTemplate.cloneNode(true));
    }
    state.households.forEach((household) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${household.code}</td>
            <td>${household.owner}</td>
            <td>${household.address}</td>
            <td>${household.residentCount || 0}</td>
            <td>
                <div class="table-actions">
                    <button data-action="edit">Sửa</button>
                    <button data-action="delete" data-action-type="delete">Xóa</button>
                </div>
            </td>
        `;
        tr.querySelector("[data-action='edit']").addEventListener("click", () => fillHouseholdForm(household));
        tr.querySelector("[data-action-type='delete']").addEventListener("click", () => deleteHousehold(household.id));
        householdTableBody.append(tr);
    });
}

function fillHouseholdForm(household) {
    householdIdField.value = household.id;
    householdCodeInput.value = household.code;
    householdCodeInput.readOnly = true;
    householdForm.owner.value = household.owner;
    householdForm.address.value = household.address;
    
    // Cập nhật UI
    householdFormTitle.textContent = "Sửa hộ khẩu";
    householdFormDesc.textContent = "Chỉnh sửa thông tin hộ khẩu (mã hộ không thể thay đổi)";
    householdSubmitBtn.textContent = "Cập nhật";
    
    // Scroll đến form
    householdForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetHouseholdForm() {
    householdForm.reset();
    householdIdField.value = "";
    householdCodeInput.readOnly = false;
    householdFormTitle.textContent = "Thêm hộ khẩu mới";
    householdFormDesc.textContent = "Nhập thông tin để thêm hộ khẩu mới vào hệ thống";
    householdSubmitBtn.textContent = "Thêm hộ khẩu";
}

async function handleHouseholdSubmit(event) {
    event.preventDefault();
    const formData = new FormData(householdForm);
    const payload = {
        code: formData.get("code").trim(),
        owner: formData.get("owner").trim(),
        address: formData.get("address").trim(),
    };
    if (!payload.code || !payload.owner || !payload.address) {
        return alert("Vui lòng nhập đủ thông tin hộ khẩu.");
    }
    
    const id = formData.get("id");
    
    // Kiểm tra mã hộ trùng khi thêm mới
    if (!id) {
        const existingHousehold = state.households.find(h => h.code.toLowerCase() === payload.code.toLowerCase());
        if (existingHousehold) {
            return alert(`Mã hộ "${payload.code}" đã tồn tại. Vui lòng sử dụng mã hộ khác.`);
        }
    }
    
    try {
        if (id) {
            // Cập nhật hộ khẩu
            await apiFetch(`/households/${id}`, { method: "PUT", body: JSON.stringify(payload) });
            alert("Cập nhật hộ khẩu thành công!");
        } else {
            // Thêm hộ khẩu mới
            await apiFetch("/households", { method: "POST", body: JSON.stringify(payload) });
            alert("Thêm hộ khẩu thành công!");
        }
        resetHouseholdForm();
        loadHouseholds();
    } catch (error) {
        // Kiểm tra lỗi từ server về mã hộ trùng
        if (error.message.includes("duplicate") || error.message.includes("trùng") || error.message.includes("đã tồn tại")) {
            alert(`Mã hộ "${payload.code}" đã tồn tại. Vui lòng sử dụng mã hộ khác.`);
        } else {
            alert(error.message);
        }
    }
}

async function deleteHousehold(id) {
    if (!confirm("Bạn chắc chắn muốn xóa hộ khẩu này?")) return;
    try {
        await apiFetch(`/households/${id}`, { method: "DELETE" });
        loadHouseholds();
    } catch (error) {
        alert(error.message);
    }
}

async function loadResidents() {
    try {
        const rows = await apiFetch("/residents");
        state.residents = rows;
        renderResidents();
    } catch (error) {
        alert(error.message);
    }
}

function renderResidents() {
    residentTableBody.innerHTML = "";
    if (!state.residents.length) {
        return residentTableBody.append(rowEmptyTemplate.cloneNode(true));
    }
    state.residents.forEach((resident) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${resident.householdCode}</td>
            <td>${resident.name}</td>
            <td>${resident.birthYear || ""}</td>
            <td>${resident.relation || ""}</td>
            <td>
                <div class="table-actions">
                    <button data-action="edit">Sửa</button>
                    <button data-action="delete" data-action-type="delete">Xóa</button>
                </div>
            </td>
        `;
        tr.querySelector("[data-action='edit']").addEventListener("click", () => fillResidentForm(resident));
        tr.querySelector("[data-action-type='delete']").addEventListener("click", () => deleteResident(resident.id));
        residentTableBody.append(tr);
    });
}

function fillResidentForm(resident) {
    residentIdField.value = resident.id;
    residentForm.householdId.value = resident.householdId;
    residentForm.name.value = resident.name;
    residentForm.birthYear.value = resident.birthYear || "";
    residentForm.relation.value = resident.relation || "";
}

async function handleResidentSubmit(event) {
    event.preventDefault();
    const formData = new FormData(residentForm);
    const payload = {
        householdId: Number(formData.get("householdId")),
        name: formData.get("name").trim(),
        birthYear: Number(formData.get("birthYear")) || null,
        relation: formData.get("relation").trim(),
    };
    if (!payload.householdId || !payload.name || !payload.relation) {
        return alert("Vui lòng nhập đầy đủ thông tin.");
    }
    const id = formData.get("id");
    try {
        if (id) {
            await apiFetch(`/residents/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        } else {
            await apiFetch("/residents", { method: "POST", body: JSON.stringify(payload) });
        }
        residentForm.reset();
        loadResidents();
        loadHouseholds();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteResident(id) {
    if (!confirm("Xóa cư dân này?")) return;
    try {
        await apiFetch(`/residents/${id}`, { method: "DELETE" });
        loadResidents();
        loadHouseholds();
    } catch (error) {
        alert(error.message);
    }
}

async function loadContributions() {
    try {
        const rows = await apiFetch("/contributions");
        state.contributions = rows;
        renderContributions();
        renderContributionTotals();
    } catch (error) {
        alert(error.message);
    }
}

function renderContributions() {
    contributionTableBody.innerHTML = "";
    if (!state.contributions.length) {
        return contributionTableBody.append(rowEmptyTemplate.cloneNode(true));
    }
    state.contributions.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.householdCode}</td>
            <td>${item.description}</td>
            <td>${formatCurrency(item.amount)}</td>
            <td>${formatDate(item.contributedAt)}</td>
            <td>
                <div class="table-actions">
                    <button data-action="edit">Sửa</button>
                    <button data-action="delete" data-action-type="delete">Xóa</button>
                </div>
            </td>
        `;
        tr.querySelector("[data-action='edit']").addEventListener("click", () => fillContributionForm(item));
        tr.querySelector("[data-action-type='delete']").addEventListener("click", () => deleteContribution(item.id));
        contributionTableBody.append(tr);
    });
}

function fillContributionForm(contribution) {
    contributionIdField.value = contribution.id;
    contributionForm.householdId.value = contribution.householdId;
    contributionForm.description.value = contribution.description;
    contributionForm.amount.value = contribution.amount;
}

function renderContributionTotals() {
    contributionTotals.innerHTML = "";
    if (!state.contributions.length) {
        contributionTotals.innerHTML = `<p class="empty">Chưa có đóng góp.</p>`;
        return;
    }
    const totals = state.contributions.reduce((acc, item) => {
        acc[item.householdId] = (acc[item.householdId] || 0) + Number(item.amount);
        return acc;
    }, {});
    Object.entries(totals).forEach(([householdId, total]) => {
        const household = state.households.find((h) => h.id === Number(householdId));
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `<span>${household?.owner || household?.code || "Hộ #"+householdId}</span><strong>${formatCurrency(total)}</strong>`;
        contributionTotals.append(div);
    });
}

async function handleContributionSubmit(event) {
    event.preventDefault();
    const formData = new FormData(contributionForm);
    const payload = {
        householdId: Number(formData.get("householdId")),
        description: formData.get("description").trim(),
        amount: Number(formData.get("amount")),
    };
    if (!payload.householdId || !payload.description || !payload.amount) {
        return alert("Vui lòng nhập đầy đủ thông tin đóng góp.");
    }
    const id = formData.get("id");
    try {
        if (id) {
            await apiFetch(`/contributions/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        } else {
            await apiFetch("/contributions", { method: "POST", body: JSON.stringify(payload) });
        }
        contributionForm.reset();
        loadContributions();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteContribution(id) {
    if (!confirm("Xóa khoản đóng góp này?")) return;
    try {
        await apiFetch(`/contributions/${id}`, { method: "DELETE" });
        loadContributions();
    } catch (error) {
        alert(error.message);
    }
}

function populateHouseholdSelects() {
    const options = state.households
        .map((household) => `<option value="${household.id}">${household.code} - ${household.owner}</option>`)
        .join("");
    const placeholder = '<option value="" disabled selected>Chọn hộ khẩu</option>';
    document.querySelectorAll('select[name="householdId"]').forEach((select) => {
        select.innerHTML = state.households.length ? placeholder + options : '<option value="">Chưa có hộ khẩu</option>';
        select.disabled = !state.households.length;
    });
}

async function handleSearch(event) {
    event.preventDefault();
    const formData = new FormData(searchForm);
    const keyword = formData.get("keyword").trim();
    const scope = formData.get("scope");
    if (!keyword) {
        return alert("Nhập từ khóa tìm kiếm.");
    }
    try {
        const result = await apiFetch(`/search?keyword=${encodeURIComponent(keyword)}&scope=${scope}`);
        renderSearchResults(result);
    } catch (error) {
        alert(error.message);
    }
}

function renderSearchResults(data) {
    const hasResult = Object.values(data).some((list) => Array.isArray(list) && list.length);
    if (!hasResult) {
        searchResults.innerHTML = `<p class="empty">Không tìm thấy dữ liệu phù hợp.</p>`;
        return;
    }
    const fragments = [];
    if (data.households?.length) {
        fragments.push(`
            <div class="search-result-card">
                <h4>Hộ khẩu (${data.households.length})</h4>
                ${data.households
                    .map(
                        (item) =>
                            `<p><strong>${item.code}</strong> - ${item.owner}<br><small>${item.address}</small></p>`,
                    )
                    .join("")}
            </div>
        `);
    }
    if (data.residents?.length) {
        fragments.push(`
            <div class="search-result-card">
                <h4>Cư dân (${data.residents.length})</h4>
                ${data.residents
                    .map(
                        (item) =>
                            `<p><strong>${item.name}</strong> (${item.householdCode})<br><small>${item.relation || ""} - ${
                                item.birthYear || "Không rõ"
                            }</small></p>`,
                    )
                    .join("")}
            </div>
        `);
    }
    if (data.contributions?.length) {
        fragments.push(`
            <div class="search-result-card">
                <h4>Đóng góp (${data.contributions.length})</h4>
                ${data.contributions
                    .map(
                        (item) =>
                            `<p><strong>${item.householdCode}</strong> - ${item.description}<br><small>${formatCurrency(
                                item.amount,
                            )} • ${formatDate(item.contributedAt)}</small></p>`,
                    )
                    .join("")}
            </div>
        `);
    }
    searchResults.innerHTML = fragments.join("");
}

async function loadSettings() {
    try {
        const current = await apiFetch("/settings");
        state.settings = current;
        settingsForm.organization.value = current?.organization || "";
        settingsForm.contactEmail.value = current?.contactEmail || "";
        settingsForm.announcement.value = current?.announcement || "";
    } catch (error) {
        alert(error.message);
    }
}

async function handleSettingsSubmit(event) {
    event.preventDefault();
    const formData = new FormData(settingsForm);
    const payload = {
        organization: formData.get("organization").trim(),
        contactEmail: formData.get("contactEmail").trim(),
        announcement: formData.get("announcement").trim(),
    };
    try {
        await apiFetch("/settings", { method: "PUT", body: JSON.stringify(payload) });
        alert("Đã lưu cài đặt.");
    } catch (error) {
        alert(error.message);
    }
}

async function apiFetch(path, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};
    if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }
    const includeAuth = options.includeAuth !== false;
    if (includeAuth && state.token) {
        headers.Authorization = `Bearer ${state.token}`;
    }
    
    // Đảm bảo mode và credentials được set đúng
    const fetchOptions = {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'include',
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload.message || "Yêu cầu thất bại");
        }
        return payload;
    } catch (error) {
        // Xử lý lỗi CORS cụ thể
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            throw new Error("Không thể kết nối đến server. Kiểm tra:\n1. Backend server đã chạy chưa?\n2. Bạn đang mở qua HTTP server (http://localhost:5500) hay file://?");
        }
        throw error;
    }
}

function formatCurrency(value) {
    const amount = Number(value) || 0;
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatDate(input) {
    if (!input) return "";
    return new Date(input).toLocaleDateString("vi-VN");
}

