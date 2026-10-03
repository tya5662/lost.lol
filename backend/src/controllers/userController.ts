// import { NextFunction, Request, Response } from 'express';
// import { pool } from '../config/database';
// // import { User } from '../types/types';
// import { ResultSetHeader } from 'mysql2';

// // import { RowDataPacket } from 'mysql2/promise';
// import { User, Link, UserWithLinks,  } from '../types/types';
// import { mediaModel } from '../model/profiles';

// export const createUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { username, name, description } = req.body;
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };

//     const [existing] = await pool.execute(
//       'SELECT id FROM users WHERE username = ?',
//       [username]
//     );

//     if (Array.isArray(existing) && existing.length > 0) {
//       res.status(400).json({ message: 'Username already taken' });
//       return; // Exit early
//     }

//     const profilePicture = files.profilePicture ? files.profilePicture[0].filename : null;
//     const backgroundMedia = files.backgroundMedia ? files.backgroundMedia[0].filename : null;
//     const backgroundType = files.backgroundMedia
//       ? (files.backgroundMedia[0].mimetype.startsWith('video') ? 'video' : 'image')
//       : null;

//       const media =  await mediaModel.create({
//         username: username,

//       })

//       // console.log({ username: username,
//       //   profileImage: profilePicture,
//       //   backgroundMedia: backgroundMedia,
//       //   backgroundType: backgroundType})
//       // await media.save()
//       console.log('saved ' ,media)

//     await pool.execute(
//       `INSERT INTO users (username, name, description,)
//        VALUES (?, ?, ?)`,
//       [username, name, description]
//     );

//     // console.log('User created')

//     res.status(201).json({ message: 'User created successfully' });
//   } catch (error) {
//     next(error); // Pass the error to the error handler
//   }
// };


// export const getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { username } = req.params;





//     const [rows] = await pool.execute<UserWithLinks[]>(
//       `SELECT
//          u.id AS userId, u.username, u.name, u.description,
//          u.profilePicture, u.backgroundMedia, u.backgroundType,
//          u.email, u.createdAt, u.updatedAt,
//          l.id AS linkId, l.title AS linkTitle, l.url AS linkUrl
//        FROM users u
//        LEFT JOIN links l ON l.userId = u.id
//        WHERE u.username = ?`,
//       [username]
//     );

//     const[totalVisit] = await pool.execute<UserWithLinks[]> (
//       `UPDATE users SET totalVisit = totalVisit + 1 WHERE username = ?` , [username]
//     )
//     if (!rows.length) {
//       res.status(404).json({ message: 'User not found' });
//       return;
//     }

//     const media = await mediaModel.findOne({username: username})
//     // console.log(media)
//     // Extract user data from the first row
//     const user = {
//       id: rows[0].userId,
//       username: rows[0].username,
//       name: rows[0].name,
//       description: rows[0].description,
//       profilePicture: media?.profileImage
//         ? `data:image/jpeg;base64,${Buffer.from(media.profileImage).toString('base64')}`
//         : null,
//       backgroundMedia: media?.backgroundMedia
//         ? `data:image/${rows[0].backgroundType || 'jpeg'};base64,${Buffer.from(media.backgroundMedia).toString('base64')}`
//         : null,
//       backgroundType: media?.backgroundType,
//       email: rows[0].email,
//       createdAt: rows[0].createdAt,
//       updatedAt: rows[0].updatedAt,
//       totalVisit: totalVisit
//     };


//     const links: Link[] = rows
//       .filter((row) => row.linkId)
//       .map((row) => ({
//         id: row.linkId as number,
//         userId: rows[0].userId,
//         title: row.linkTitle as string,
//         url: row.linkUrl as string,
//         order: 0,
//         createdAt: rows[0].createdAt,
//         updatedAt: rows[0].updatedAt,
//       }));

//     // Combine user and links into the profile response
//     const userProfile = {
//       ...user,
//       links,
//     };

//     res.json(userProfile);
//   } catch (error) {
//     next(error);
//   }
// };




// export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { username } = req.params;
//     const { name, description } = req.body;
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };

//     // Fetch user ID from MySQL
//     const [user] = await pool.execute(
//       'SELECT id FROM users WHERE username = ?',
//       [username]
//     );

//     if (!Array.isArray(user) || user.length === 0) {
//       res.status(404).json({ message: 'User not found' });
//       return; // Exit early
//     }

//     const profilePicture = files.profilePicture ? files.profilePicture[0].buffer : undefined;
//     const backgroundMedia = files.backgroundMedia ? files.backgroundMedia[0].buffer : undefined;
//     const backgroundType = files.backgroundMedia
//       ? (files.backgroundMedia[0].mimetype.startsWith('video') ? 'video' : 'image')
//       : undefined;

//     let updateQuery = 'UPDATE users SET name = ?, description = ?';
//     const params: (string | Buffer)[] = [name, description];

//     if (profilePicture) {
//       const mediaUpdate = await mediaModel.updateOne(
//         { username: username },
//         { $set: { profileImage: profilePicture } }
//       );
//       console.log('Profile picture update result:', mediaUpdate);
//     }

//     if (backgroundMedia) {
//       const mediaUpdate = await mediaModel.updateOne(
//         { username: username },
//         { $set: { backgroundMedia: backgroundMedia, backgroundType: backgroundType } }
//       );
//       console.log('Background media update result:', mediaUpdate);
//     }

//     // Continue with MySQL update query
//     updateQuery += ' WHERE username = ?';
//     params.push(username);

//     console.log('MySQL update query:', updateQuery);
//     await pool.execute(updateQuery, params);

//     res.json({ message: 'User updated successfully' });
//   } catch (error) {
//     console.error('Error updating user:', error);
//     next(error);
//   }
// };


// export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { username } = req.params;

//     const [result] = await pool.execute(
//       'DELETE FROM users WHERE username = ?',
//       [username]
//     );

//     if ((result as any).affectedRows === 0) {
//       res.status(404).json({ message: 'User not found' });
//       return;
//     }

//     res.json({ message: 'User deleted successfully' });
//   } catch (error) {
//     next(error);
//   }
// };

// export const setUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const { username } = req.body;
//   const userId = (req.user as User).id;

//   try {

//     if (!username || !userId) {
//       res.status(400).json({ message: "Username and User ID are required" });
//       return;
//     }


//     const usernameRegex = /^[a-z0-9_]{3,20}$/;
//     if (!usernameRegex.test(username)) {
//       res.status(400).json({
//         message: "Username must be 3-20 characters long and can only contain lowercase letters, numbers, and underscores"
//       });
//       return;
//     }
//     else if(username == "dashboard"){
//       res.status(400).json({
//         message: "Trying to be cheeky? YOU CANNOT USE IT."
//       })
//     }

//     // Check if username exists
//     const [existingUsers] = await pool.execute(
//       'SELECT id FROM users WHERE username = ? AND id != ?',
//       [username, userId]
//     );

//     if (Array.isArray(existingUsers) && existingUsers.length > 0) {
//       res.status(200).json({ exists: true });
//       return;
//     }


//     // const connection = await pool.getConnection();
//     // await connection.beginTransaction();

//     try {
//       // Update username
//       const [updateResult] = await pool.execute(
//         'UPDATE users SET username = ? WHERE id = ?',
//         [username, userId]
//       );


//       // const [mediaResult] = await connection.execute(
//       //   'INSERT INTO media (username) VALUES (?)',
//       //   [username]
//       // );

//      await mediaModel.create({username: username})
//       // await connection.commit();

//       const result = updateResult as ResultSetHeader;

//       if (result.affectedRows > 0) {
//         res.status(200).json({
//           exists: false,
//           userId,
//           username,
//           message: "Username set successfully"
//         });
//       } else {
//         // await connection.rollback();
//         res.status(500).json({ message: "Failed to update username" });
//       }
//     } catch (error) {
//       // await connection.rollback();
//       throw error;
//     }
//   } catch (error) {
//     console.error('Error in setUsername:', error);
//     next(error);
//   }
// };


import { NextFunction, Request, Response } from 'express';
import { User } from '../model/profiles'; // Assuming you have a User model
import { Link } from '../model/link'; // Assuming you have a Link model
import mongoose from 'mongoose';

export const createUser = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
  try {
    const { username, name, description } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
       res.status(400).json({ message: 'Username already taken' });
       return
    }

    // Handle file uploads
    const profilePicture = files.profilePicture ? files.profilePicture[0].buffer : undefined;
    const backgroundMedia = files.backgroundMedia ? files.backgroundMedia[0].buffer : undefined;
    const backgroundType = files.backgroundMedia
      ? (files.backgroundMedia[0].mimetype.startsWith('video') ? 'video' : 'image')
      : undefined;

    // Create new user
    const newUser = new User({
      username,
      name,
      description,
      profilePicture,
      backgroundMedia,
      backgroundType
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    next(error);
  }
};

export const getUserByUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username } = req.params;

    // Find user and increment total visit
    const user = await User.findOneAndUpdate(
      { username },
      { $inc: { totalVisit: 1 } },
      { new: true }
    );

    if (!user) {
       res.status(404).json({ message: 'User not found' });
       return
    }

    // Find links for the user
    const links = await Link.find({ userId: user._id }).sort({ order: 1 });

    // Prepare user profile response
    const userProfile = {
      ...user.toObject(),
      profilePicture: user.profilePicture
        ? `data:image/jpeg;base64,${user.profilePicture.toString('base64')}`
        : null,
      backgroundMedia: user.backgroundMedia
        ? `data:${user.backgroundType === 'video' ? 'video/mp4' : 'image/jpeg'};base64,${user.backgroundMedia.toString('base64')}`
        : null,
      links
    };

    res.json(userProfile);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username } = req.params;
    const { name, description } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
       res.status(404).json({ message: 'User not found' });
       return
    }

    // Update basic user info
    user.name = name;
    user.description = description;

    // Handle profile picture
    if (files.profilePicture) {
      user.profilePicture = files.profilePicture[0].buffer;
    }

    // Handle background media
    if (files.backgroundMedia) {
      user.backgroundMedia = files.backgroundMedia[0].buffer;
      user.backgroundType = files.backgroundMedia[0].mimetype.startsWith('video') ? 'video' : 'image';
    }

    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
  try {
    const { username } = req.params;

    // Delete user and associated links
    const deletedUser = await User.findOneAndDelete({ username });

    if (!deletedUser) {
       res.status(404).json({ message: 'User not found' });
       return
    }

    // Optional: Delete all links associated with the user
    await Link.deleteMany({ userId: deletedUser._id });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Adjust the import path as per your project structure

export const setUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username } = req.body;
    const userId = (req.user as any).id; // Assuming `id` is populated in the `req.user` middleware

    // Validation
    if (!username || typeof userId === "undefined") {
      res.status(400).json({ message: "Username and User ID are required" });
      return;
    }

    // Username regex validation
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      res.status(400).json({
        message:
          "Username must be 3-20 characters long and can only contain lowercase letters, numbers, and underscores",
      });
      return;
    }

    // Keep profile names from shadowing application routes.
    if (["api", "auth", "dashboard", "login", "register"].includes(username)) {
      res.status(400).json({
        message: "That username is reserved.",
      });
      return;
    }

    // Check if username exists for another user
    const existingUser = await User.findOne({
      username,
      id: { $ne: userId }, // Ensure the same `username` is not already used by another user
    });

    if (existingUser) {
      res.status(200).json({ exists: true });
      return;
    }

    // Update username
    const updatedUser = await User.findOneAndUpdate(
      { id: userId }, // Match using `id` (auto-incremented number)
      { username },
      { new: true }
    );

    if (!updatedUser) {
      res.status(500).json({ message: "Failed to update username" });
      return;
    }

    res.status(200).json({
      exists: false,
      userId: updatedUser.id,
      username: updatedUser.username,
      message: "Username set successfully",
    });
  } catch (error) {
    console.error("Error in setUsername:", error);
    next(error);
  }
};
