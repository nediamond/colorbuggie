# colorbuggie
Colorbuggie is a needlessly complex DHTML thingy.

Essentially, it is a semi-intelligent, semi-random color path which walks around the window using the following algorithm:

1. Find all unvisited neighbors of the current position
2. Of those neighbors, find the ones where moving to that position will not create a new partition of empty spaces.
3. If such neighbors exist, select a random one, move there, and restart algorithm. Else, continue to step 4.
4. Find the neighboring space for which moving there will create the largest partition, move there, and then move into the newly created largest partition. Restart algorithm.
