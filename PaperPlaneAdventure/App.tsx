import React, { useEffect, useState } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Text,
  Alert,
  Button,
} from "react-native";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

const GRAVITY = 1.5;
const FLAP_STRENGTH = -25;
const OBSTACLE_SPEED = 4;
const BACKGROUND_SPEED = 2;
const GAP_HEIGHT = 280;
const PLANE_WIDTH = 70;
const OBSTACLE_WIDTH = 60;
const PLANE_LEFT = 60;

export default function PaperPlaneAdventure() {
  const [planeY, setPlaneY] = useState(height / 2);
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState([
    { x: width, height: Math.random() * (height - GAP_HEIGHT) },
  ]);
  const [bgOffset, setBgOffset] = useState(0);
  const [cloudOffset, setCloudOffset] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      setVelocity((v) => v + GRAVITY);
      setPlaneY((y) => y + velocity);
      setBgOffset((prev) => (prev - BACKGROUND_SPEED) % width);
      setCloudOffset((prev) => (prev - BACKGROUND_SPEED * 0.5) % width);

      setObstacles((prev) => {
        let newObstacles = prev.map((obs) => ({
          ...obs,
          x: obs.x - OBSTACLE_SPEED,
        }));

        if (newObstacles[0].x < -OBSTACLE_WIDTH) {
          newObstacles.shift();
          newObstacles.push({
            x: width,
            height: Math.random() * (height - GAP_HEIGHT),
          });
          setScore((s) => s + 1);
        }

        const current = newObstacles[0];
        const overlapsX =
          current.x < PLANE_LEFT + PLANE_WIDTH &&
          current.x + OBSTACLE_WIDTH > PLANE_LEFT;
        const hitsObstacle =
          planeY < current.height ||
          planeY > current.height + GAP_HEIGHT;

        if (overlapsX && hitsObstacle) {
          setGameOver(true);
        }

        return newObstacles;
      });
    }, 30);

    return () => clearInterval(gameLoop);
  }, [velocity, planeY, obstacles, gameOver]);

  const handleTap = () => {
    if (gameOver) return;
    setVelocity(FLAP_STRENGTH);
  };

  const restartGame = () => {
    setPlaneY(height / 2);
    setVelocity(0);
    setObstacles([
      { x: width, height: Math.random() * (height - GAP_HEIGHT) },
    ]);
    setScore(0);
    setBgOffset(0);
    setCloudOffset(0);
    setGameOver(false);
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        <StatusBar hidden />

        {/* Background sky */}
        <View style={styles.backgroundWrapper}>
          <View style={[styles.backgroundTile, { left: bgOffset }]} />
          <View style={[styles.backgroundTile, { left: bgOffset + width }]} />
        </View>

        {/* Parallax clouds */}
        <Image
          source={require("./assets/clouds.png")}
          style={[styles.clouds, { left: cloudOffset }]}
        />
        <Image
          source={require("./assets/clouds.png")}
          style={[styles.clouds, { left: cloudOffset + width }]}
        />

        <View style={styles.foregroundWrapper}>
          <Text style={styles.title}>Paper Plane Adventure</Text>

          {obstacles.map((obs, index) => (
            <React.Fragment key={`obstacle-${index}`}>
              <View
                style={[
                  styles.obstacle,
                  {
                    height: obs.height,
                    left: obs.x,
                    top: 0,
                  },
                ]}
              />
              <View
                style={[
                  styles.obstacle,
                  {
                    height: height - obs.height - GAP_HEIGHT,
                    left: obs.x,
                    top: obs.height + GAP_HEIGHT,
                  },
                ]}
              />
            </React.Fragment>
          ))}

          <Image
            source={require("./assets/paper_plane.png")}
            style={[styles.plane, { top: planeY }]}
          />

          <Text style={styles.score}>Score: {score}</Text>

          {gameOver && (
            <View style={styles.gameOverContainer}>
              <Text style={styles.gameOverText}>Game Over</Text>
              <Button title="Restart" onPress={restartGame} />
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
  backgroundWrapper: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: -2,
  },
  backgroundTile: {
    width: width,
    height: height,
    backgroundColor: "#87CEEB",
    position: "absolute",
  },
  clouds: {
    position: "absolute",
    top: 50,
    width: width,
    height: 100,
    resizeMode: "contain",
    zIndex: -1,
  },
  foregroundWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 40,
  },
  plane: {
    position: "absolute",
    left: PLANE_LEFT,
    width: PLANE_WIDTH,
    height: PLANE_WIDTH,
    resizeMode: "contain",
  },
  obstacle: {
    position: "absolute",
    width: OBSTACLE_WIDTH,
    backgroundColor: "#228B22",
  },
  score: {
    position: "absolute",
    top: 80,
    left: 20,
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  gameOverContainer: {
    position: "absolute",
    top: height / 2 - 60,
    left: width / 2 - 100,
    width: 200,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
    borderRadius: 10,
  },
  gameOverText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
});
