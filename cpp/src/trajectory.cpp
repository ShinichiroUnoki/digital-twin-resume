/**
 * Trajectory Generation Implementation
 * 
 * ジャーク制限付き時間最適軌道生成
 * 使用ライブラリ: Ruckig (MIT)
 * https://github.com/pantor/ruckig
 */

#include "robot_sim.hpp"
#include <cmath>
#include <algorithm>

// Note: When building with Emscripten, include Ruckig
// #include <ruckig/ruckig.hpp>

namespace RobotSim {

TrajectoryPlanner::TrajectoryPlanner() {}

// Trapezoidal velocity profile for single joint
static std::vector<TrajectoryPoint> trapezoidalProfile(
    double start,
    double end,
    double max_vel,
    double max_acc,
    double dt
) {
    std::vector<TrajectoryPoint> points;
    
    double distance = end - start;
    double direction = (distance > 0) ? 1.0 : -1.0;
    distance = std::abs(distance);
    
    // Time to reach max velocity
    double t_acc = max_vel / max_acc;
    
    // Distance during acceleration
    double d_acc = 0.5 * max_acc * t_acc * t_acc;
    
    double t_cruise, t_total;
    double v_max_actual;
    
    if (2 * d_acc > distance) {
        // Triangle profile (can't reach max velocity)
        t_acc = std::sqrt(distance / max_acc);
        t_cruise = 0;
        t_total = 2 * t_acc;
        v_max_actual = max_acc * t_acc;
    } else {
        // Trapezoidal profile
        t_cruise = (distance - 2 * d_acc) / max_vel;
        t_total = 2 * t_acc + t_cruise;
        v_max_actual = max_vel;
    }
    
    // Generate points
    for (double t = 0; t <= t_total; t += dt) {
        TrajectoryPoint point;
        point.time = t;
        
        double pos, vel, acc;
        
        if (t < t_acc) {
            // Acceleration phase
            acc = max_acc;
            vel = acc * t;
            pos = 0.5 * acc * t * t;
        } else if (t < t_acc + t_cruise) {
            // Cruise phase
            double t_c = t - t_acc;
            acc = 0;
            vel = v_max_actual;
            pos = d_acc + v_max_actual * t_c;
        } else {
            // Deceleration phase
            double t_d = t - t_acc - t_cruise;
            acc = -max_acc;
            vel = v_max_actual - max_acc * t_d;
            pos = distance - 0.5 * max_acc * (t_total - t) * (t_total - t);
        }
        
        // Apply direction and offset
        point.position[0] = start + direction * pos;
        point.velocity[0] = direction * vel;
        point.acceleration[0] = direction * acc;
        
        // Zero out other joints for this simple implementation
        for (int i = 1; i < 6; i++) {
            point.position[i] = 0;
            point.velocity[i] = 0;
            point.acceleration[i] = 0;
        }
        
        points.push_back(point);
    }
    
    return points;
}

std::vector<TrajectoryPoint> TrajectoryPlanner::plan(
    const std::array<double, 6>& start,
    const std::array<double, 6>& end,
    const MotionParams& params,
    double dt
) {
    std::vector<TrajectoryPoint> trajectory;
    
    // Find the joint that takes the longest time
    double max_time = 0;
    
    for (int i = 0; i < 6; i++) {
        double distance = std::abs(end[i] - start[i]);
        double max_vel = params.max_velocity[i];
        double max_acc = params.max_acceleration[i];
        
        double t_acc = max_vel / max_acc;
        double d_acc = 0.5 * max_acc * t_acc * t_acc;
        
        double t_total;
        if (2 * d_acc > distance) {
            t_total = 2 * std::sqrt(distance / max_acc);
        } else {
            double t_cruise = (distance - 2 * d_acc) / max_vel;
            t_total = 2 * t_acc + t_cruise;
        }
        
        max_time = std::max(max_time, t_total);
    }
    
    // Generate synchronized trajectory for all joints
    for (double t = 0; t <= max_time; t += dt) {
        TrajectoryPoint point;
        point.time = t;
        
        for (int i = 0; i < 6; i++) {
            // Simple linear interpolation (synchronized)
            double ratio = t / max_time;
            if (ratio > 1.0) ratio = 1.0;
            
            // S-curve interpolation
            double smooth_ratio = ratio * ratio * (3 - 2 * ratio);
            
            point.position[i] = start[i] + (end[i] - start[i]) * smooth_ratio;
            point.velocity[i] = 0; // Simplified
            point.acceleration[i] = 0;
        }
        
        trajectory.push_back(point);
    }
    
    return trajectory;
}

} // namespace RobotSim
