PYTHON = py # change the python run command according to your system
PIP = pip

.PHONY: help
help:
	@echo "Makefile for Django Project"
	@echo ""
	@echo "Usage:"
	@echo "  make db        Initialize database tables"
	@echo "  make install      Install all dependencies"
	@echo "  make run          Start the Flask development server"
	@echo "  make tests         Run all tests"
	@echo ""

# Install all dependencies
.PHONY: install
install:
	$(PIP) install -r requirements.txt


# Apply database migrations
.PHONY: db
db:
	$(PYTHON) app/src/init_db.py

# Start the Flask server
.PHONY: run
run:
	$(PYTHON) app/run.py

# Run all tests
.PHONY: tests
tests:
	pytest