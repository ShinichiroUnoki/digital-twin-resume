/**
 * Emscripten Bindings
 * 
 * C++ クラスを JavaScript から呼び出せるようにする
 */

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#include "robot_sim.hpp"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(robot_sim) {
    // JointAngles struct
    value_object<RobotSim::JointAngles>("JointAngles")
        .field("theta", &RobotSim::JointAngles::theta);
    
    // MotionParams struct
    value_object<RobotSim::MotionParams>("MotionParams")
        .field("maxVelocity", &RobotSim::MotionParams::max_velocity)
        .field("maxAcceleration", &RobotSim::MotionParams::max_acceleration)
        .field("maxJerk", &RobotSim::MotionParams::max_jerk);
    
    // TrajectoryPoint struct
    value_object<RobotSim::TrajectoryPoint>("TrajectoryPoint")
        .field("time", &RobotSim::TrajectoryPoint::time)
        .field("position", &RobotSim::TrajectoryPoint::position)
        .field("velocity", &RobotSim::TrajectoryPoint::velocity)
        .field("acceleration", &RobotSim::TrajectoryPoint::acceleration);
    
    // Register std::array<double, 6>
    register_vector<double>("VectorDouble");
    value_array<std::array<double, 6>>("ArrayDouble6")
        .element(emscripten::index<0>())
        .element(emscripten::index<1>())
        .element(emscripten::index<2>())
        .element(emscripten::index<3>())
        .element(emscripten::index<4>())
        .element(emscripten::index<5>());
    
    // Register std::vector<TrajectoryPoint>
    register_vector<RobotSim::TrajectoryPoint>("VectorTrajectoryPoint");
    register_vector<RobotSim::JointAngles>("VectorJointAngles");
    
    // RobotKinematics class
    class_<RobotSim::RobotKinematics>("RobotKinematics")
        .constructor()
        .function("forwardKinematics", &RobotSim::RobotKinematics::forwardKinematics)
        .function("inverseKinematics", &RobotSim::RobotKinematics::inverseKinematics);
    
    // TrajectoryPlanner class
    class_<RobotSim::TrajectoryPlanner>("TrajectoryPlanner")
        .constructor()
        .function("plan", &RobotSim::TrajectoryPlanner::plan);
}

#endif // __EMSCRIPTEN__
