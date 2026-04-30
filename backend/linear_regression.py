import numpy as np
from sklearn.linear_model import LinearRegression

class BurstTimePredictor:
    def __init__(self):
        self.model = LinearRegression()
        self._train()

    def _train(self):
        # Fake training dataset
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
            [7, 2]
        ])

        y = np.array([5, 3, 6, 9, 7, 10, 4, 5, 2, 6])

        self.model.fit(X, y)

    def predict(self, at, prio):
        return round(self.model.predict([[at, prio]])[0], 2)