#pragma once

#include <array>
#include <vector>

namespace RobotSim {

// Joint angles for 6-DOF robot
struct JointAngles {
    std::array<double, 6> theta;
};

// DH Parameters
struct DHParams {
    double a;      // Link length
    double d;      // Link offset
    double alpha;  // Link twist
};

// Trajectory point
struct TrajectoryPoint {
    double time;
    std::array<double, 6> position;
    std::array<double, 6> velocity;
    std::array<double, 6> acceleration;
};

// Motion parameters
struct MotionParams {
    std::array<double, 6> max_velocity;
    std::array<double, 6> max_acceleration;
    std::array<double, 6> max_jerk;
};

// Robot Kinematics class
class RobotKinematics {
public:
    RobotKinematics();
    
    // Forward kinematics: joint angles -> end effector pose
    std::array<double, 16> forwardKinematics(const JointAngles& q);
    
    // Inverse kinematics: end effector pose -> joint angles
    std::vector<JointAngles> inverseKinematics(
        const std::array<double, 3>& position,
        const std::array<double, 9>& rotation
    );

private:
    std::vector<DHParams> dh_params_;
};

// Trajectory Planner class
class TrajectoryPlanner {
public:
    TrajectoryPlanner();
    
    // Generate time-optimal trajectory
    std::vector<TrajectoryPoint> plan(
        const std::array<double, 6>& start,
        const std::array<double, 6>& end,
        const MotionParams& params,
        double dt = 0.01
    );
};

} // namespace RobotSim
