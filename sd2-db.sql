-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Mar 20, 2025 at 08:38 PM
-- Server version: 8.2.0
-- PHP Version: 8.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sd2-db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `total_price` decimal(10,2) NOT NULL, 
  `status` enum('Pending','Confirmed','Cancelled') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `user_id`, `room_id`, `check_in`, `check_out`, `total_price`, `status`, `created_at`) VALUES
(1, 1, 3, '2025-04-10', '2025-04-15', 1750.00, 'Confirmed', '2025-03-20 20:38:01'),
(2, 2, 2, '2025-04-12', '2025-04-14', 360.00, 'Confirmed', '2025-03-20 20:38:01'),
(3, 3, 5, '2025-05-01', '2025-05-07', 1140.00, 'Pending', '2025-03-20 20:38:01'),
(4, 4, 4, '2025-06-15', '2025-06-20', 1250.00, 'Confirmed', '2025-03-20 20:38:01'),
(5, 5, 1, '2025-07-01', '2025-07-03', 240.00, 'Cancelled', '2025-03-20 20:38:01');

-- --------------------------------------------------------

--
-- Table structure for table `contact_us`
--

CREATE TABLE `contact_us` (
  `contact_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `room_id` int NOT NULL,
  `room_number` varchar(10) NOT NULL,
  `type` enum('Single','Double','Suite','Deluxe') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('Available','Booked','Maintenance') DEFAULT 'Available',
  `description` text,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`room_id`, `room_number`, `type`, `price`, `status`, `description`, `image_url`) VALUES
(1, '101', 'Single', 120.00, 'Available', 'Cozy single room in a central London hotel.', 'single_room.jpg'),
(2, '202', 'Double', 180.00, 'Available', 'Spacious double room with city views.', 'double_room.jpg'),
(3, '303', 'Suite', 350.00, 'Available', 'Luxury suite with a private balcony.', 'suite_room.jpg'),
(4, '404', 'Deluxe', 250.00, 'Available', 'Deluxe room with premium amenities.', 'deluxe_room.jpg'),
(5, '505', 'Double', 190.00, 'Available', 'Elegant double room near Hyde Park.', 'double_room_2.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','customer') DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `phone`, `password`, `role`, `created_at`) VALUES
(1, 'Amit Sharma', 'amit.sharma@example.com', '+91 9876543210', 'password123', 'customer', '2025-03-20 20:37:37'),
(2, 'Priya Patel', 'priya.patel@example.com', '+91 8765432109', 'securepass', 'customer', '2025-03-20 20:37:37'),
(3, 'Rajesh Kumar', 'rajesh.kumar@example.com', '+91 9988776655', 'rajpass456', 'customer', '2025-03-20 20:37:37'),
(4, 'Neha Verma', 'neha.verma@example.com', '+91 8877665544', 'nehapass789', 'customer', '2025-03-20 20:37:37'),
(5, 'Vikram Rao', 'vikram.rao@example.com', '+91 7766554433', 'vikrampass101', 'customer', '2025-03-20 20:37:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `contact_us`
--
ALTER TABLE `contact_us`
  ADD PRIMARY KEY (`contact_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`room_id`),
  ADD UNIQUE KEY `room_number` (`room_number`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `contact_us`
--
ALTER TABLE `contact_us`
  MODIFY `contact_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
