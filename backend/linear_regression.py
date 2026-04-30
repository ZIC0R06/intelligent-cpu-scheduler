import numpy as np
import logging
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
from typing import List, Tuple, Optional
import pickle
import os

# Configure logging for debugging and monitoring
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class BurstTimePredictor:
    """
    A linear regression based predictor for CPU burst time given arrival time and priority.
    
    This model uses historical data to estimate the expected burst time of a process
    based on its arrival time and priority level. It supports training, prediction,
    evaluation, and persistence.
    """

    def __init__(self, use_scaler: bool = True):
        """
        Initialize the predictor with optional feature scaling.

        Args:
            use_scaler: Whether to standardize input features before training/prediction.
        """
        self.model = LinearRegression()
        self.scaler = StandardScaler() if use_scaler else None
        self.is_trained = False
        self._train()

    def _prepare_features(self, X: np.ndarray, fit: bool = False) -> np.ndarray:
        """
        Apply optional feature scaling to the input matrix.

        Args:
            X: Input feature matrix of shape (n_samples, 2) -> [arrival_time, priority]
            fit: If True, fit the scaler to the data; otherwise transform using existing scaler.

        Returns:
            Scaled feature matrix (or unchanged if scaler is not used).
        """
        if self.scaler is None:
            return X
        if fit:
            return self.scaler.fit_transform(X)
        else:
            return self.scaler.transform(X)

    def _load_historical_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Load and return the training dataset.

        In a production scenario, this could read from a database or CSV file.
        Here we return a hardcoded set of examples for demonstration.

        Returns:
            X: Feature matrix (arrival_time, priority)
            y: Target vector (burst_time)
        """
        # Historical observations: each row = [arrival_time, priority]
        X = np.array([
            [0, 3],
            [2, 1],
            [4, 2],
            [6, 5],
            [8, 3],
            [10, 4],
            [1, 2],
            [3, 3],
            [5, 1],
            [7, 2],
            [9, 3],     # Additional data for better generalization
            [11, 4],
            [2, 5],
            [12, 2],
            [14, 3]
        ])

        y = np.array([5, 3, 6, 9, 7, 10, 4, 5, 2, 6, 8, 11, 6, 9, 10])

        logger.info(f"Loaded {len(y)} training samples")
        return X, y

    def _train(self) -> None:
        """
        Train the linear regression model using the historical dataset.
        This method is called automatically during initialization.
        """
        X_raw, y = self._load_historical_data()

        # Apply feature scaling if enabled
        if self.scaler is not None:
            X = self._prepare_features(X_raw, fit=True)
        else:
            X = X_raw

        # Train the model
        self.model.fit(X, y)
        self.is_trained = True

        # Evaluate on training data for diagnostic purposes
        y_pred = self.model.predict(X)
        mae = mean_absolute_error(y, y_pred)
        rmse = np.sqrt(mean_squared_error(y, y_pred))
        logger.info(f"Model trained. Training MAE: {mae:.4f}, RMSE: {rmse:.4f}")

        # Log model coefficients for interpretability
        coef = self.model.coef_
        intercept = self.model.intercept_
        logger.info(f"Coefficients: {coef}, Intercept: {intercept:.4f}")

    def predict(self, at: float, prio: int) -> float:
        """
        Predict burst time for a process given arrival time and priority.

        Args:
            at: Arrival time (can be integer or float).
            prio: Priority level (integer, lower value may indicate higher priority depending on system).

        Returns:
            Predicted burst time rounded to two decimal places.

        Raises:
            RuntimeError: If the model has not been trained.
        """
        if not self.is_trained:
            raise RuntimeError("Model is not trained. Please train the model first.")

        # Input validation
        if not isinstance(at, (int, float)) or at < 0:
            raise ValueError(f"Arrival time must be a non-negative number, got {at}")
        if not isinstance(prio, int) or prio < 0:
            raise ValueError(f"Priority must be a non-negative integer, got {prio}")

        # Prepare input
        X_input = np.array([[at, prio]])
        if self.scaler is not None:
            X_input = self.scaler.transform(X_input)

        prediction = self.model.predict(X_input)[0]
        rounded_prediction = round(prediction, 2)

        logger.debug(f"Prediction for (at={at}, prio={prio}): {rounded_prediction}")
        return rounded_prediction

    def retrain(self, X_new: np.ndarray, y_new: np.ndarray) -> None:
        """
        Retrain the model with additional data (incremental learning).

        Note: LinearRegression in sklearn does not support online learning,
        so this method concatenates new data with existing training data and retrains.

        Args:
            X_new: New feature matrix (arrival_time, priority) for training.
            y_new: New target values (burst_time).

        Raises:
            ValueError: If input shapes are invalid.
        """
        if X_new.shape[0] != y_new.shape[0]:
            raise ValueError("Number of samples in X_new and y_new must match")
        if X_new.shape[1] != 2:
            raise ValueError("X_new must have exactly two columns (arrival_time, priority)")

        # Load original data
        X_old, y_old = self._load_historical_data()
        X_combined = np.vstack([X_old, X_new])
        y_combined = np.concatenate([y_old, y_new])

        # Retrain the scaler if used
        if self.scaler is not None:
            X_scaled = self._prepare_features(X_combined, fit=True)
        else:
            X_scaled = X_combined

        self.model.fit(X_scaled, y_combined)
        self.is_trained = True
        logger.info(f"Retrained model with {len(y_combined)} total samples")

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> dict:
        """
        Evaluate the model performance on a test set.

        Args:
            X_test: Test feature matrix.
            y_test: True burst times.

        Returns:
            Dictionary containing MAE, RMSE, and R^2 score.
        """
        if not self.is_trained:
            raise RuntimeError("Model is not trained.")

        if X_test.shape[0] != y_test.shape[0]:
            raise ValueError("Mismatch between X_test and y_test sizes")

        if self.scaler is not None:
            X_test_scaled = self.scaler.transform(X_test)
        else:
            X_test_scaled = X_test

        y_pred = self.model.predict(X_test_scaled)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = self.model.score(X_test_scaled, y_test)

        metrics = {"MAE": mae, "RMSE": rmse, "R2": r2}
        logger.info(f"Evaluation metrics: {metrics}")
        return metrics

    def save_model(self, filepath: str) -> None:
        """
        Save the trained model (including scaler if used) to disk.

        Args:
            filepath: Path where the model should be saved (e.g., 'burst_predictor.pkl').
        """
        if not self.is_trained:
            raise RuntimeError("Cannot save untrained model.")

        state = {
            "model": self.model,
            "scaler": self.scaler,
            "is_trained": self.is_trained
        }
        with open(filepath, 'wb') as f:
            pickle.dump(state, f)
        logger.info(f"Model saved to {filepath}")

    @classmethod
    def load_model(cls, filepath: str) -> 'BurstTimePredictor':
        """
        Load a previously saved model from disk.

        Args:
            filepath: Path to the saved model file.

        Returns:
            BurstTimePredictor instance with restored state.
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file {filepath} not found.")

        with open(filepath, 'rb') as f:
            state = pickle.load(f)

        instance = cls(use_scaler=state["scaler"] is not None)
        instance.model = state["model"]
        instance.scaler = state["scaler"]
        instance.is_trained = state["is_trained"]
        logger.info(f"Model loaded from {filepath}")
        return instance


# Example usage and demonstration
if __name__ == "__main__":
    # Create predictor (automatically trains on default data)
    predictor = BurstTimePredictor(use_scaler=True)

    # Make some predictions
    test_cases = [
        (0, 3),   # Expected ~5
        (2, 1),   # Expected ~3
        (4, 2),   # Expected ~6
        (7, 5),   # Higher priority may reduce burst time depending on correlation
        (15, 4),
    ]

    print("\n--- Predictions ---")
    for at, prio in test_cases:
        burst = predictor.predict(at, prio)
        print(f"Arrival Time: {at}, Priority: {prio} -> Predicted Burst Time: {burst} ms")

    # Evaluate on a small hold-out set (example)
    X_test = np.array([[1, 4], [3, 1], [5, 3]])
    y_test = np.array([4.5, 3.2, 6.8])  # hypothetical true values
    print("\n--- Evaluation ---")
    metrics = predictor.evaluate(X_test, y_test)
    for key, val in metrics.items():
        print(f"{key}: {val:.4f}")

    # Save the model for later use
    predictor.save_model("burst_predictor.pkl")

    # Load the model and verify it works
    loaded_predictor = BurstTimePredictor.load_model("burst_predictor.pkl")
    print("\n--- Loaded Model Prediction ---")
    print(f"Prediction from loaded model: {loaded_predictor.predict(0, 3)}")

    # Demonstrate retraining with additional data
    X_additional = np.array([[12, 1], [13, 2]])
    y_additional = np.array([12, 11])
    predictor.retrain(X_additional, y_additional)
    print("\n--- After Retraining ---")
    print(f"New prediction for (13,2): {predictor.predict(13, 2)}")