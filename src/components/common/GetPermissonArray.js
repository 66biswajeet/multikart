let storePermission = {};
let storedRole = null;

// Ensure the code runs only in the browser
if (typeof window !== "undefined") {
  const accountData = localStorage.getItem("account");
  storePermission = accountData ? JSON.parse(accountData) : {};

  const roleData = localStorage.getItem("role");
  storedRole = roleData ? JSON.parse(roleData) : null;
}

// Given this ignore list for adding below menus
const paymentPermission = storedRole?.name === "vendor" ? "PaymentDetails" : "";
const ignoreList = ["Dashboard", paymentPermission];

// Modify the sidebar as per permissions
export const getPermissionArray = (sidebarItems) => {
  return sidebarItems.reduce((filteredItems, item) => {
    const clonedItem = { ...item };

    if (ignoreList.includes(item.title)) {
      filteredItems.push(item);
    }

    if (clonedItem.permission) {
      clonedItem.permission = clonedItem.permission.filter((perm) => {
        return storePermission?.permissions?.some((p) => p.name === perm);
      });
    }

    if (clonedItem?.children && clonedItem.children.length > 0) {
      clonedItem.children = getPermissionArray(clonedItem.children);
    }

    if (
      clonedItem?.permission?.length > 0 ||
      (clonedItem?.children && clonedItem?.children?.length > 0)
    ) {
      filteredItems.push(clonedItem);
    }

    return filteredItems;
  }, []);
};
