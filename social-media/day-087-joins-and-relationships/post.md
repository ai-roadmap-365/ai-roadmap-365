Day 87 of 365 Days of AI — Joins and Relationships

Say why data belongs in more than one table — by reproducing the update, insertion and deletion anomalies of a single wide table yourself — and then put the pieces back together on demand: modelling one-to-many with the key on the many side and many-to-many with a junction table keyed on the pair, writing inner, left outer, cross, self and multi-table joins while being able to state exactly which rows each keeps and which columns it fills with NULL, reaching for the LEFT JOIN plus IS NULL idiom whenever a question is about absence, avoiding the two separate mistakes that turn a per-group count of zero into a wrong answer, knowing why an outer join predicate belongs in ON rather than WHERE, proving for yourself that SQLite enforces no foreign key until PRAGMA foreign_keys = ON is issued on that connection, and implementing both a nested-loop and a hash join in plain Python so that the algorithm the query planner is choosing between is one you have written.

What today covers:
→ Reproduce the update
→ State what a foreign key actually promises and what it does not
→ Model a one-to-many relationship by putting the foreign key on the many side

The lab is the point: 30 minutes of hands-on work you run yourself, offline, with output you can check against a real captured run.

📖 Lesson (~70 min): https://sandeepbazar.github.io/ai-roadmap-365/day-087-joins-and-relationships
🧪 Lab: https://github.com/sandeepbazar/ai-roadmap-365/tree/main/labs/sections/programming-with-python/day-087-joins-and-relationships

Course 02 of 9 · Programming with Python

Free, open source, and no prerequisites beyond curiosity.

#AI #365DaysOfAI #LearningInPublic #Python #MachineLearning
