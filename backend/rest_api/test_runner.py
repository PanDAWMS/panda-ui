from django.test.runner import DiscoverRunner


class TestRunner(DiscoverRunner):
    """
    Test runner that uses an existing database directly
    without attempting to CREATE or DROP test tables/databases.
    """

    def setup_databases(self, **kwargs):
        # Do not create a new database or alter existing schemas
        print("Running tests against existing database...")
        return None

    def teardown_databases(self, old_config, **kwargs):
        # Do not attempt to drop tables/databases on exit
        pass
