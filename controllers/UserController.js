import axiosInstance from "../utility/axiosInstance";

async function authenticate(email, password) {
  try {
    const response = await axiosInstance.post("/user/authenticate/", {
      email,
      password,
    });
    return response.data.message;
  } catch (error) {
    if (error.response) {
      return error.response.data.message;
    }
  }
}

async function createNewUser(email, password, firstName, lastName, gender) {
  try {
    const response = await axiosInstance.post("/user/register/", {
      email,
      password,
      firstName,
      lastName,
      gender,
    });
    return response.data.message;
  } catch (error) {
    if (error.response) {
      return error.response.data.message;
    }
  }
}

async function getUserByEmail(email) {
  try {
    const response = await axiosInstance.post("/user/profile/", { email });
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.message;
    }
  }
}

async function getUserFirstName(email) {
  const userFound = await getUserByEmail(email);
  return userFound.FirstName;
}

async function getSalutation(email) {
  const userFound = await getUserByEmail(email);
  const gender = userFound.Gender;

  if (gender === "F") {
    return "Ms";
  } else {
    return "Mr";
  }
}
async function updateUser(req, res) {
  const { email, firstName, lastName } = req.body;

  // Log the entire request body for debugging purposes
  console.log("Request body:", req.body);

  // Log the received parameters for debugging purposes
  console.log("Received parameters:", { email, firstName, lastName });

  if (!email || !firstName || !lastName) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sqlQuery =
    "UPDATE User SET firstName = ?, lastName = ? WHERE email = ?";

  try {
    const updateResult = await query(sqlQuery, [firstName, lastName, email]);
    console.log("SQL Query Executed:", sqlQuery);
    console.log("Update Result:", updateResult);

    if (updateResult.affectedRows) {
      return res.status(200).json({ message: "User updated successfully." });
    } else {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.error("Failed to update user:", error);
    return res.status(500).json({ message: "Failed to update user." });
  }
}

async function deleteUser(req, res) {
  const { email } = req.body;

  const sqlQuery = "DELETE FROM User WHERE email = ?";

  try {
    const deleteResult = await query(sqlQuery, [email]);
    console.log("SQL Query Executed:", sqlQuery);
    console.log("Delete Result:", deleteResult);

    if (deleteResult.affectedRows) {
      return res.status(200).json({ message: "User deleted successfully." });
    } else {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.error("Failed to delete user:", error);
    return res.status(500).json({ message: "Failed to delete user." });
  }
}

async function verifyToken(token) {
  try {
    const response = await axiosInstance.post("/email/verify-email/", {
      token,
    });
    return response.data.message;
  } catch (error) {
    if (error.response) {
      return error.response.data.message;
    }
  }
}

export {
  authenticate,
  createNewUser,
  getUserByEmail,
  getUserFirstName,
  getSalutation,
  verifyToken,
  updateUser,
  deleteUser,
};
