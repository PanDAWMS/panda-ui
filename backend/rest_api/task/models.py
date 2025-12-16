from django.conf import settings
from django.db import models
from django.db.models import DO_NOTHING


class JediTask(models.Model):
    jeditaskid = models.BigIntegerField(primary_key=True, db_column="jeditaskid")
    taskname = models.CharField(max_length=384, db_column="taskname", blank=True)
    status = models.CharField(max_length=192, db_column="status")
    superstatus = models.CharField(max_length=64, db_column="superstatus", blank=True)
    username = models.CharField(max_length=384, db_column="username")
    reqid = models.IntegerField(null=True, db_column="reqid", blank=True)
    site = models.CharField(max_length=180, db_column="site", blank=True)
    prodsourcelabel = models.CharField(max_length=60, db_column="prodsourcelabel", blank=True)
    workinggroup = models.CharField(max_length=96, db_column="workinggroup", blank=True)
    vo = models.CharField(max_length=48, db_column="vo", blank=True)
    tasktype = models.CharField(max_length=192, db_column="tasktype", blank=True)
    processingtype = models.CharField(max_length=192, db_column="processingtype", blank=True)
    framework = models.CharField(max_length=100, db_column="framework", blank=True)
    architecture = models.CharField(max_length=768, db_column="architecture", blank=True)
    transuses = models.CharField(max_length=192, db_column="transuses", blank=True)
    transhome = models.CharField(max_length=384, db_column="transhome", blank=True)
    transpath = models.CharField(max_length=384, db_column="transpath", blank=True)
    termcondition = models.CharField(max_length=300, db_column="termcondition", blank=True)
    splitrule = models.CharField(max_length=300, db_column="splitrule", blank=True)
    workqueue_id = models.IntegerField(null=True, db_column="workqueue_id", blank=True)
    errordialog = models.CharField(max_length=765, db_column="errordialog", blank=True)
    parent_tid = models.BigIntegerField(db_column="parent_tid", blank=True)
    eventservice = models.IntegerField(null=True, db_column="eventservice", blank=True)
    campaign = models.CharField(max_length=72, db_column="campaign", blank=True)
    gshare = models.CharField(max_length=72, db_column="gshare", blank=True)
    nucleus = models.CharField(max_length=72, db_column="nucleus", blank=True)
    requesttype = models.CharField(max_length=72, db_column="requesttype", blank=True)
    resourcetype = models.CharField(max_length=300, db_column="resource_type", blank=True)
    usejumbo = models.CharField(max_length=10, db_column="usejumbo", blank=True)
    container_name = models.CharField(max_length=200, db_column="container_name", blank=True)
    currentpriority = models.IntegerField(null=True, db_column="currentpriority", blank=True)
    taskpriority = models.IntegerField(null=True, db_column="taskpriority", blank=True)
    corecount = models.IntegerField(null=True, db_column="corecount", blank=True)
    attemptnr = models.IntegerField(null=True, db_column="attemptnr", blank=True)
    lockedby = models.CharField(max_length=120, db_column="lockedby", blank=True)
    lockedtime = models.DateTimeField(null=True, db_column="lockedtime", blank=True)

    # timestamps
    creationdate = models.DateTimeField(db_column="creationdate")
    starttime = models.DateTimeField(null=True, db_column="starttime", blank=True)
    endtime = models.DateTimeField(null=True, db_column="endtime", blank=True)
    frozentime = models.DateTimeField(null=True, db_column="frozentime", blank=True)
    statechangetime = models.DateTimeField(null=True, db_column="statechangetime", blank=True)
    resquetime = models.DateTimeField(null=True, db_column="rescuetime", blank=True)
    modificationtime = models.DateTimeField(db_column="realmodificationtime")

    # job related metrics
    walltime = models.IntegerField(null=True, db_column="walltime", blank=True)
    walltimeunit = models.CharField(max_length=96, db_column="walltimeunit", blank=True)
    outdiskcount = models.IntegerField(null=True, db_column="outdiskcount", blank=True)
    outdiskunit = models.CharField(max_length=96, db_column="outdiskunit", blank=True)
    workdiskcount = models.IntegerField(null=True, db_column="workdiskcount", blank=True)
    workdiskunit = models.CharField(max_length=96, db_column="workdiskunit", blank=True)
    ramcount = models.IntegerField(null=True, db_column="ramcount", blank=True)
    ramunit = models.CharField(max_length=96, db_column="ramunit", blank=True)
    iointensity = models.IntegerField(null=True, db_column="iointensity", blank=True)
    iointensityunit = models.CharField(max_length=96, db_column="iointensityunit", blank=True)
    diskio = models.IntegerField(null=True, db_column="diskio", blank=True)
    diskiounit = models.CharField(max_length=96, db_column="diskiounit", blank=True)
    basewalltime = models.IntegerField(null=True, db_column="basewalltime", blank=True)
    cputime = models.IntegerField(null=True, db_column="cputime", blank=True)
    cputimeunit = models.CharField(max_length=72, db_column="cputimeunit", blank=True)
    cpuefficiency = models.IntegerField(null=True, db_column="cpuefficiency", blank=True)
    memoryleakcore = models.BigIntegerField(null=True, db_column="memory_leak_core", blank=True)
    memoryleakx2 = models.BigIntegerField(null=True, db_column="memory_leak_x2", blank=True)

    class Meta:
        managed = False
        db_table = f'"{settings.DB_SCHEMAS['panda']}"."jedi_tasks"'
        verbose_name = "JediTask"
        verbose_name_plural = "JediTasks"


class JediDataset(models.Model):

    jeditaskid = models.ForeignKey(
        JediTask,
        on_delete=DO_NOTHING,
        db_column="jeditaskid",
        related_name="jedi_datasets",
    )
    datasetid = models.BigIntegerField(db_column="datasetid", primary_key=True)
    datasetname = models.CharField(max_length=765, db_column="datasetname")
    type = models.CharField(max_length=60, db_column="type")
    creationtime = models.DateTimeField(db_column="creationtime")
    modificationtime = models.DateTimeField(db_column="modificationtime")
    vo = models.CharField(max_length=48, db_column="vo", blank=True)
    cloud = models.CharField(max_length=30, db_column="cloud", blank=True)
    site = models.CharField(max_length=180, db_column="site", blank=True)
    masterid = models.BigIntegerField(null=True, db_column="masterid", blank=True)
    provenanceid = models.BigIntegerField(null=True, db_column="provenanceid", blank=True)
    containername = models.CharField(max_length=396, db_column="containername", blank=True)
    status = models.CharField(max_length=60, db_column="status", blank=True)
    state = models.CharField(max_length=60, db_column="state", blank=True)
    statechecktime = models.DateTimeField(null=True, db_column="statechecktime", blank=True)
    statecheckexpiration = models.DateTimeField(null=True, db_column="statecheckexpiration", blank=True)
    frozentime = models.DateTimeField(null=True, db_column="frozentime", blank=True)
    nfiles = models.IntegerField(null=True, db_column="nfiles", blank=True)
    nfilestobeused = models.IntegerField(null=True, db_column="nfilestobeused", blank=True)
    nfilesused = models.IntegerField(null=True, db_column="nfilesused", blank=True)
    nevents = models.BigIntegerField(null=True, db_column="nevents", blank=True)
    neventstobeused = models.BigIntegerField(null=True, db_column="neventstobeused", blank=True)
    neventsused = models.BigIntegerField(null=True, db_column="neventsused", blank=True)
    lockedby = models.CharField(max_length=120, db_column="lockedby", blank=True)
    lockedtime = models.DateTimeField(null=True, db_column="lockedtime", blank=True)
    nfilesfinished = models.IntegerField(null=True, db_column="nfilesfinished", blank=True)
    nfilesfailed = models.IntegerField(null=True, db_column="nfilesfailed", blank=True)
    attributes = models.CharField(max_length=300, db_column="attributes", blank=True)
    streamname = models.CharField(max_length=60, db_column="streamname", blank=True)
    storagetoken = models.CharField(max_length=180, db_column="storagetoken", blank=True)
    destination = models.CharField(max_length=180, db_column="destination", blank=True)
    nfilesonhold = models.IntegerField(null=True, db_column="nfilesonhold", blank=True)
    templateid = models.BigIntegerField(db_column="templateid", blank=True)
    nfileswaiting = models.IntegerField(null=True, db_column="nfileswaiting", blank=True)
    nfilesmissing = models.IntegerField(null=True, db_column="nfilesmissing", blank=True)

    class Meta:
        managed = False
        db_table = f'"{settings.DB_SCHEMAS['panda']}"."jedi_datasets"'
        verbose_name = "JediDataset"
        verbose_name_plural = "JediDatasets"
