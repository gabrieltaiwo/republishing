SHELL := /bin/bash
TITLES := $(basename $(notdir $(wildcard titles/*.conf)))

.PHONY: help run all build status export dashboard
help:
	@echo "Targets:"
	@echo "  make run SLUG=history-of-the-yorubas   # run mechanical pipeline (Gates 1-2)"
	@echo "  make build SLUG=history-of-the-yorubas # compile cover, EPUB, and PDF (Gate 4)"
	@echo "  make all                               # run pipeline for all titles"
	@echo "  make status                            # show each title's stage"
	@echo "  make export                            # sync repo state to dashboard JSON"
	@echo "  make dashboard                         # launch Next.js dashboard locally"

run:
	@test -n "$(SLUG)" || { echo "set SLUG=<slug>"; exit 1; }
	@./pipeline.sh $(SLUG)

build:
	@test -n "$(SLUG)" || { echo "set SLUG=<slug>"; exit 1; }
	@./build.sh $(SLUG)

export:
	@python3 tools/export_state.py

dashboard: export
	@cd dashboard && npm run dev

all:
	@for s in $(TITLES); do ./pipeline.sh $$s || exit 1; done

status:
	@printf '%-34s %s\n' "TITLE" "STAGE"
	@for s in $(TITLES); do \
	  if [ -f "$$s/build/$$s.pdf" ]; then st="built — Gate 4 complete (EPUB & PDF ready)"; \
	  elif [ -f "$$s/text/clean.txt" ]; then st="cleaned — review Gate 2 / write Gate 3"; \
	  elif [ -d "$$s" ]; then st="scaffolded"; \
	  else st="config only"; fi; \
	  printf '%-34s %s\n' "$$s" "$$st"; \
	done
